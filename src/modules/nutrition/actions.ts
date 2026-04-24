"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { calculateMealDraftPreview, calculateMealItemNutrition } from "@/modules/nutrition/service";

const previewMealSchema = z.object({
  foodItemId: z.string().min(1, "Выберите продукт или блюдо."),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  quantityGrams: z.coerce.number().positive("Количество должно быть больше нуля."),
  consumedAt: z.string().min(1, "Укажите дату и время."),
  note: z.string().optional(),
});

export type MealDraftActionState = {
  error?: string;
  success?: string;
  form?: {
    foodItemId: string;
    mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
    quantityGrams: string;
    consumedAt: string;
    note: string;
  };
  preview?: {
    itemName: string;
    mealTypeLabel: string;
    quantityGrams: number;
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

function toStateForm(input: z.infer<typeof previewMealSchema>) {
  return {
    foodItemId: input.foodItemId,
    mealType: input.mealType,
    quantityGrams: String(input.quantityGrams),
    consumedAt: input.consumedAt,
    note: input.note || "",
  };
}

async function buildPreviewState(input: z.infer<typeof previewMealSchema>): Promise<MealDraftActionState> {
  const session = await requireSession();
  const foodItem = await prisma.foodItem.findUnique({
    where: { id: input.foodItemId },
  });

  if (!foodItem || !foodItem.isActive) {
    return { error: "Выбранный продукт недоступен.", form: toStateForm(input) };
  }

  const preview = await calculateMealDraftPreview({
    userId: session.user.id,
    foodItem,
    quantityGrams: input.quantityGrams,
    mealType: input.mealType,
    consumedAt: new Date(input.consumedAt),
  });

  return {
    form: toStateForm(input),
    preview: {
      itemName: foodItem.name,
      mealTypeLabel: preview.mealTypeLabel,
      quantityGrams: input.quantityGrams,
      current: preview.current,
      delta: preview.delta,
      projected: preview.projected,
      targets: preview.targets,
    },
  };
}

export async function previewMealDraftAction(
  _prevState: MealDraftActionState,
  formData: FormData,
): Promise<MealDraftActionState> {
  const parsed = previewMealSchema.safeParse({
    foodItemId: formData.get("foodItemId"),
    mealType: formData.get("mealType"),
    quantityGrams: formData.get("quantityGrams"),
    consumedAt: formData.get("consumedAt"),
    note: formData.get("note"),
  });

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
  const parsed = previewMealSchema.safeParse({
    foodItemId: formData.get("foodItemId"),
    mealType: formData.get("mealType"),
    quantityGrams: formData.get("quantityGrams"),
    consumedAt: formData.get("consumedAt"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Проверьте форму черновика." };
  }

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
    quantityGrams: parsed.data.quantityGrams,
  });

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
        create: {
          foodItemId: foodItem.id,
          quantityGrams: new Prisma.Decimal(parsed.data.quantityGrams),
          calories: new Prisma.Decimal(itemNutrition.calories),
          proteinG: new Prisma.Decimal(itemNutrition.proteinG),
          fatG: new Prisma.Decimal(itemNutrition.fatG),
          carbsG: new Prisma.Decimal(itemNutrition.carbsG),
        },
      },
    },
  });

  revalidatePath("/nutrition");
  revalidatePath("/nutrition/draft");
  redirect(`/nutrition?date=${parsed.data.consumedAt.slice(0, 10)}`);
}
