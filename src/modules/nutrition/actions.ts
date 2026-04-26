"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import {
  calculateMealDraftPreview,
  calculateMealItemNutrition,
  calculateMealPortionNutrition,
} from "@/modules/nutrition/service";

const mealDraftSchema = z
  .object({
    entryMode: z.enum(["CATALOG", "MANUAL_100G", "MANUAL_PORTION"]),
    foodItemId: z.string().optional(),
    customName: z.string().optional(),
    mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
    quantityGrams: z.coerce.number().optional(),
    portionCount: z.coerce.number().optional(),
    manualCalories: z.coerce.number().optional(),
    manualProteinG: z.coerce.number().optional(),
    manualFatG: z.coerce.number().optional(),
    manualCarbsG: z.coerce.number().optional(),
    consumedAt: z.string().min(1, "Укажите дату и время."),
    note: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.entryMode === "CATALOG") {
      if (!value.foodItemId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["foodItemId"],
          message: "Выберите продукт или блюдо из базы.",
        });
      }

      if (!value.quantityGrams || value.quantityGrams <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["quantityGrams"],
          message: "Количество в граммах должно быть больше нуля.",
        });
      }
    }

    if (value.entryMode === "MANUAL_100G") {
      if (!value.customName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customName"],
          message: "Введите название блюда или позиции.",
        });
      }

      if (!value.quantityGrams || value.quantityGrams <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["quantityGrams"],
          message: "Количество в граммах должно быть больше нуля.",
        });
      }
    }

    if (value.entryMode === "MANUAL_PORTION") {
      if (!value.customName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customName"],
          message: "Введите название блюда или позиции.",
        });
      }

      if (!value.portionCount || value.portionCount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["portionCount"],
          message: "Количество порций должно быть больше нуля.",
        });
      }
    }

    for (const field of ["manualCalories", "manualProteinG", "manualFatG", "manualCarbsG"] as const) {
      if (value.entryMode !== "CATALOG") {
        const currentValue = value[field];

        if (currentValue === undefined || Number.isNaN(currentValue) || currentValue < 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: "Введите корректные КБЖУ.",
          });
        }
      }
    }
  });

const deleteMealEntrySchema = z.object({
  mealEntryId: z.string().min(1, "Не удалось определить прием пищи."),
});

type MealDraftInput = z.infer<typeof mealDraftSchema>;

export type MealDraftActionState = {
  error?: string;
  success?: string;
  form?: {
    entryMode: "CATALOG" | "MANUAL_100G" | "MANUAL_PORTION";
    foodItemId: string;
    customName: string;
    mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
    quantityGrams: string;
    portionCount: string;
    manualCalories: string;
    manualProteinG: string;
    manualFatG: string;
    manualCarbsG: string;
    consumedAt: string;
    note: string;
  };
  preview?: {
    itemName: string;
    mealTypeLabel: string;
    quantityLabel: string;
    current: {
      calories: number;
      proteinG: number;
      fatG: number;
      carbsG: number;
    };
    delta: {
      calories: number;
      proteinG: number;
      fatG: number;
      carbsG: number;
    };
    projected: {
      calories: number;
      proteinG: number;
      fatG: number;
      carbsG: number;
    };
    targets: {
      calories: number;
      proteinG: number;
      fatG: number;
      carbsG: number;
    } | null;
  };
};

function toStateForm(input: MealDraftInput): NonNullable<MealDraftActionState["form"]> {
  return {
    entryMode: input.entryMode,
    foodItemId: input.foodItemId || "",
    customName: input.customName || "",
    mealType: input.mealType,
    quantityGrams: input.quantityGrams ? String(input.quantityGrams) : "",
    portionCount: input.portionCount ? String(input.portionCount) : "1",
    manualCalories: input.manualCalories !== undefined ? String(input.manualCalories) : "",
    manualProteinG: input.manualProteinG !== undefined ? String(input.manualProteinG) : "",
    manualFatG: input.manualFatG !== undefined ? String(input.manualFatG) : "",
    manualCarbsG: input.manualCarbsG !== undefined ? String(input.manualCarbsG) : "",
    consumedAt: input.consumedAt,
    note: input.note || "",
  };
}

function getManualDelta(input: MealDraftInput) {
  if (input.entryMode === "MANUAL_100G") {
    return calculateMealItemNutrition({
      caloriesPer100g: input.manualCalories || 0,
      proteinPer100g: input.manualProteinG || 0,
      fatPer100g: input.manualFatG || 0,
      carbsPer100g: input.manualCarbsG || 0,
      quantityGrams: input.quantityGrams || 0,
    });
  }

  return calculateMealPortionNutrition({
    caloriesPerPortion: input.manualCalories || 0,
    proteinPerPortion: input.manualProteinG || 0,
    fatPerPortion: input.manualFatG || 0,
    carbsPerPortion: input.manualCarbsG || 0,
    portionCount: input.portionCount || 0,
  });
}

async function buildPreviewState(input: MealDraftInput): Promise<MealDraftActionState> {
  const session = await requireSession();

  if (input.entryMode === "CATALOG") {
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: input.foodItemId },
    });

    if (!foodItem || !foodItem.isActive) {
      return { error: "Выбранный продукт недоступен.", form: toStateForm(input) };
    }

    const preview = await calculateMealDraftPreview({
      userId: session.user.id,
      foodItem,
      quantityGrams: input.quantityGrams || 0,
      mealType: input.mealType,
      consumedAt: new Date(input.consumedAt),
    });

    return {
      form: toStateForm(input),
      preview: {
        itemName: foodItem.name,
        mealTypeLabel: preview.mealTypeLabel,
        quantityLabel: `${input.quantityGrams} г`,
        current: preview.current,
        delta: preview.delta,
        projected: preview.projected,
        targets: preview.targets,
      },
    };
  }

  const preview = await calculateMealDraftPreview({
    userId: session.user.id,
    foodItem: {
      caloriesPer100g: 0,
      proteinPer100g: 0,
      fatPer100g: 0,
      carbsPer100g: 0,
    },
    quantityGrams: 0,
    mealType: input.mealType,
    consumedAt: new Date(input.consumedAt),
    manualDelta: getManualDelta(input),
  });

  return {
    form: toStateForm(input),
    preview: {
      itemName: input.customName || "Ручная запись",
      mealTypeLabel: preview.mealTypeLabel,
      quantityLabel:
        input.entryMode === "MANUAL_100G" ? `${input.quantityGrams} г` : `${input.portionCount} порц.`,
      current: preview.current,
      delta: preview.delta,
      projected: preview.projected,
      targets: preview.targets,
    },
  };
}

function parseMealDraft(formData: FormData) {
  return mealDraftSchema.safeParse({
    entryMode: formData.get("entryMode"),
    foodItemId: formData.get("foodItemId"),
    customName: formData.get("customName"),
    mealType: formData.get("mealType"),
    quantityGrams: formData.get("quantityGrams"),
    portionCount: formData.get("portionCount"),
    manualCalories: formData.get("manualCalories"),
    manualProteinG: formData.get("manualProteinG"),
    manualFatG: formData.get("manualFatG"),
    manualCarbsG: formData.get("manualCarbsG"),
    consumedAt: formData.get("consumedAt"),
    note: formData.get("note"),
  });
}

export async function previewMealDraftAction(
  _prevState: MealDraftActionState,
  formData: FormData,
): Promise<MealDraftActionState> {
  const parsed = parseMealDraft(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Проверьте форму черновика." };
  }

  return buildPreviewState(parsed.data);
}

export async function saveMealDraftAction(
  _prevState: MealDraftActionState,
  formData: FormData,
): Promise<MealDraftActionState> {
  const session = await requireSession();
  const parsed = parseMealDraft(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Проверьте форму черновика." };
  }

  if (parsed.data.entryMode === "CATALOG") {
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: parsed.data.foodItemId },
    });

    if (!foodItem || !foodItem.isActive) {
      return { error: "Выбранный продукт недоступен.", form: toStateForm(parsed.data) };
    }

    const itemNutrition = calculateMealItemNutrition({
      caloriesPer100g: Number(foodItem.caloriesPer100g),
      proteinPer100g: Number(foodItem.proteinPer100g),
      fatPer100g: Number(foodItem.fatPer100g),
      carbsPer100g: Number(foodItem.carbsPer100g),
      quantityGrams: parsed.data.quantityGrams || 0,
    });

    const catalogMealItem: Prisma.MealItemCreateWithoutMealEntryInput = {
      quantityGrams: new Prisma.Decimal(parsed.data.quantityGrams || 0),
      calories: new Prisma.Decimal(itemNutrition.calories),
      proteinG: new Prisma.Decimal(itemNutrition.proteinG),
      fatG: new Prisma.Decimal(itemNutrition.fatG),
      carbsG: new Prisma.Decimal(itemNutrition.carbsG),
      foodItem: {
        connect: { id: foodItem.id },
      },
    };

    await prisma.mealEntry.create({
      data: {
        userId: session.user.id,
        mealType: parsed.data.mealType,
        consumedAt: new Date(parsed.data.consumedAt),
        note: parsed.data.note || null,
        totalCalories: new Prisma.Decimal(itemNutrition.calories),
        totalProteinG: new Prisma.Decimal(itemNutrition.proteinG),
        totalFatG: new Prisma.Decimal(itemNutrition.fatG),
        totalCarbsG: new Prisma.Decimal(itemNutrition.carbsG),
        items: {
          create: catalogMealItem,
        },
      },
    });
  } else {
    const itemNutrition = getManualDelta(parsed.data);
    const manualMealItem: Prisma.MealItemUncheckedCreateWithoutMealEntryInput = {
      customName: parsed.data.customName?.trim() || "Ручная запись",
      quantityGrams:
        parsed.data.entryMode === "MANUAL_100G" ? new Prisma.Decimal(parsed.data.quantityGrams || 0) : null,
      portionCount:
        parsed.data.entryMode === "MANUAL_PORTION" ? new Prisma.Decimal(parsed.data.portionCount || 0) : null,
      calories: new Prisma.Decimal(itemNutrition.calories),
      proteinG: new Prisma.Decimal(itemNutrition.proteinG),
      fatG: new Prisma.Decimal(itemNutrition.fatG),
      carbsG: new Prisma.Decimal(itemNutrition.carbsG),
    };

    await prisma.mealEntry.create({
      data: {
        userId: session.user.id,
        mealType: parsed.data.mealType,
        consumedAt: new Date(parsed.data.consumedAt),
        note: parsed.data.note || null,
        totalCalories: new Prisma.Decimal(itemNutrition.calories),
        totalProteinG: new Prisma.Decimal(itemNutrition.proteinG),
        totalFatG: new Prisma.Decimal(itemNutrition.fatG),
        totalCarbsG: new Prisma.Decimal(itemNutrition.carbsG),
        items: {
          create: manualMealItem,
        },
      },
    });
  }

  revalidatePath("/nutrition");
  revalidatePath("/nutrition/draft");
  redirect(`/nutrition?date=${parsed.data.consumedAt.slice(0, 10)}`);
}

export async function deleteMealEntryAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const parsed = deleteMealEntrySchema.safeParse({
    mealEntryId: formData.get("mealEntryId"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Не удалось удалить прием пищи.");
  }

  await prisma.mealEntry.deleteMany({
    where: {
      id: parsed.data.mealEntryId,
      userId: session.user.id,
    },
  });

  revalidatePath("/nutrition");
  revalidatePath("/dashboard");
  revalidatePath("/family");
}
