"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { calculateMealItemNutrition, calculateMealPortionNutrition } from "@/modules/nutrition/service";

const planItemSchema = z
  .object({
    planId: z.string().min(1, "Не удалось определить план дня."),
    planDate: z.string().min(1, "Не удалось определить дату плана."),
    entryMode: z.enum(["CATALOG", "MANUAL_100G", "MANUAL_PORTION"]),
    mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
    foodItemId: z.string().optional(),
    customName: z.string().optional(),
    quantityGrams: z.coerce.number().optional(),
    portionCount: z.coerce.number().optional(),
    manualCalories: z.coerce.number().optional(),
    manualProteinG: z.coerce.number().optional(),
    manualFatG: z.coerce.number().optional(),
    manualCarbsG: z.coerce.number().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.entryMode === "CATALOG") {
      if (!value.foodItemId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["foodItemId"], message: "Выберите продукт или блюдо." });
      }
      if (!value.quantityGrams || value.quantityGrams <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["quantityGrams"], message: "Укажите граммовку больше нуля." });
      }
    }

    if (value.entryMode === "MANUAL_100G") {
      if (!value.customName?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["customName"], message: "Введите название позиции." });
      }
      if (!value.quantityGrams || value.quantityGrams <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["quantityGrams"], message: "Укажите граммовку больше нуля." });
      }
    }

    if (value.entryMode === "MANUAL_PORTION") {
      if (!value.customName?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["customName"], message: "Введите название позиции." });
      }
      if (!value.portionCount || value.portionCount <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["portionCount"], message: "Укажите количество порций больше нуля." });
      }
    }

    for (const field of ["manualCalories", "manualProteinG", "manualFatG", "manualCarbsG"] as const) {
      if (value.entryMode !== "CATALOG") {
        const current = value[field];
        if (current === undefined || Number.isNaN(current) || current < 0) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: "Введите корректные КБЖУ." });
        }
      }
    }
  });

const planItemActionSchema = z.object({
  planItemId: z.string().min(1, "Не удалось определить позицию плана."),
  planDate: z.string().min(1, "Не удалось определить дату плана."),
});

const mealSectionTransferSchema = z.object({
  planId: z.string().min(1, "Не удалось определить план дня."),
  planDate: z.string().min(1, "Не удалось определить дату плана."),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
});

export type PlanItemFormState = {
  error?: string;
  success?: string;
};

function optionalText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : undefined;
}

function buildRedirectUrl(planDate: string) {
  return `/nutrition/plan?date=${planDate}`;
}

async function updatePlanStatus(planId: string) {
  const items = await prisma.dayNutritionPlanItem.findMany({
    where: { planId },
    select: { isLogged: true },
  });

  const totalItems = items.length;
  const loggedItems = items.filter((item) => item.isLogged).length;

  const status =
    totalItems === 0 || loggedItems === 0
      ? "DRAFT"
      : loggedItems === totalItems
        ? "COMPLETED"
        : "PARTIALLY_LOGGED";

  await prisma.dayNutritionPlan.update({
    where: { id: planId },
    data: { status },
  });
}

function revalidateNutritionPlanPaths() {
  revalidatePath("/nutrition/plan");
  revalidatePath("/nutrition");
  revalidatePath("/dashboard");
  revalidatePath("/family");
}

function getManualNutrition(input: z.infer<typeof planItemSchema>) {
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

export async function addPlanItemAction(_prevState: PlanItemFormState, formData: FormData): Promise<PlanItemFormState> {
  const session = await requireSession();
  const parsed = planItemSchema.safeParse({
    planId: formData.get("planId"),
    planDate: formData.get("planDate"),
    entryMode: formData.get("entryMode"),
    mealType: formData.get("mealType"),
    foodItemId: optionalText(formData.get("foodItemId")),
    customName: optionalText(formData.get("customName")),
    quantityGrams: optionalText(formData.get("quantityGrams")),
    portionCount: optionalText(formData.get("portionCount")),
    manualCalories: optionalText(formData.get("manualCalories")),
    manualProteinG: optionalText(formData.get("manualProteinG")),
    manualFatG: optionalText(formData.get("manualFatG")),
    manualCarbsG: optionalText(formData.get("manualCarbsG")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Проверьте форму планируемого приема пищи." };
  }

  const plan = await prisma.dayNutritionPlan.findFirst({
    where: {
      id: parsed.data.planId,
      userId: session.user.id,
    },
  });

  if (!plan) {
    return { error: "План дня не найден." };
  }

  if (parsed.data.entryMode === "CATALOG") {
    const foodItem = await prisma.foodItem.findFirst({
      where: {
        id: parsed.data.foodItemId,
        isActive: true,
      },
    });

    if (!foodItem) {
      return { error: "Выбранный продукт или блюдо больше недоступны." };
    }

    const nutrition = calculateMealItemNutrition({
      caloriesPer100g: Number(foodItem.caloriesPer100g),
      proteinPer100g: Number(foodItem.proteinPer100g),
      fatPer100g: Number(foodItem.fatPer100g),
      carbsPer100g: Number(foodItem.carbsPer100g),
      quantityGrams: parsed.data.quantityGrams || 0,
    });

    await prisma.dayNutritionPlanItem.create({
      data: {
        planId: plan.id,
        mealType: parsed.data.mealType,
        foodItemId: foodItem.id,
        quantityGrams: new Prisma.Decimal(parsed.data.quantityGrams || 0),
        calories: new Prisma.Decimal(nutrition.calories),
        proteinG: new Prisma.Decimal(nutrition.proteinG),
        fatG: new Prisma.Decimal(nutrition.fatG),
        carbsG: new Prisma.Decimal(nutrition.carbsG),
      },
    });
  } else {
    const nutrition = getManualNutrition(parsed.data);

    await prisma.dayNutritionPlanItem.create({
      data: {
        planId: plan.id,
        mealType: parsed.data.mealType,
        customName: parsed.data.customName?.trim() || "Ручная запись",
        quantityGrams:
          parsed.data.entryMode === "MANUAL_100G" ? new Prisma.Decimal(parsed.data.quantityGrams || 0) : null,
        portionCount:
          parsed.data.entryMode === "MANUAL_PORTION" ? new Prisma.Decimal(parsed.data.portionCount || 0) : null,
        calories: new Prisma.Decimal(nutrition.calories),
        proteinG: new Prisma.Decimal(nutrition.proteinG),
        fatG: new Prisma.Decimal(nutrition.fatG),
        carbsG: new Prisma.Decimal(nutrition.carbsG),
      },
    });
  }

  await updatePlanStatus(plan.id);
  revalidateNutritionPlanPaths();
  redirect(buildRedirectUrl(parsed.data.planDate));
}

export async function deletePlanItemAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const parsed = planItemActionSchema.safeParse({
    planItemId: formData.get("planItemId"),
    planDate: formData.get("planDate"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Не удалось удалить позицию плана.");
  }

  const planItem = await prisma.dayNutritionPlanItem.findFirst({
    where: {
      id: parsed.data.planItemId,
      plan: {
        userId: session.user.id,
      },
    },
    select: {
      id: true,
      planId: true,
    },
  });

  if (!planItem) {
    throw new Error("Позиция плана не найдена.");
  }

  await prisma.dayNutritionPlanItem.delete({
    where: { id: planItem.id },
  });

  await updatePlanStatus(planItem.planId);
  revalidateNutritionPlanPaths();
  redirect(buildRedirectUrl(parsed.data.planDate));
}

export async function transferPlanItemToFactAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const parsed = planItemActionSchema.safeParse({
    planItemId: formData.get("planItemId"),
    planDate: formData.get("planDate"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Не удалось перенести позицию в факт.");
  }

  const planItem = await prisma.dayNutritionPlanItem.findFirst({
    where: {
      id: parsed.data.planItemId,
      plan: {
        userId: session.user.id,
      },
    },
    include: {
      foodItem: true,
      plan: true,
    },
  });

  if (!planItem || planItem.isLogged) {
    revalidateNutritionPlanPaths();
    redirect(buildRedirectUrl(parsed.data.planDate));
  }

  const mealEntry = await prisma.mealEntry.create({
    data: {
      userId: session.user.id,
      mealType: planItem.mealType,
      consumedAt: new Date(planItem.plan.plannedFor),
      note: "Перенесено из плана дня",
      totalCalories: new Prisma.Decimal(planItem.calories),
      totalProteinG: new Prisma.Decimal(planItem.proteinG),
      totalFatG: new Prisma.Decimal(planItem.fatG),
      totalCarbsG: new Prisma.Decimal(planItem.carbsG),
      items: {
        create:
          planItem.foodItemId && planItem.foodItem
            ? {
                quantityGrams: planItem.quantityGrams,
                calories: planItem.calories,
                proteinG: planItem.proteinG,
                fatG: planItem.fatG,
                carbsG: planItem.carbsG,
                foodItem: {
                  connect: { id: planItem.foodItemId },
                },
              }
            : {
                customName: planItem.customName,
                quantityGrams: planItem.quantityGrams,
                portionCount: planItem.portionCount,
                calories: planItem.calories,
                proteinG: planItem.proteinG,
                fatG: planItem.fatG,
                carbsG: planItem.carbsG,
              },
      },
    },
  });

  await prisma.dayNutritionPlanItem.update({
    where: { id: planItem.id },
    data: {
      isLogged: true,
      loggedMealEntryId: mealEntry.id,
    },
  });

  await updatePlanStatus(planItem.planId);
  revalidateNutritionPlanPaths();
  redirect(buildRedirectUrl(parsed.data.planDate));
}

export async function transferMealPlanSectionToFactAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const parsed = mealSectionTransferSchema.safeParse({
    planId: formData.get("planId"),
    planDate: formData.get("planDate"),
    mealType: formData.get("mealType"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Не удалось перенести прием пищи в факт.");
  }

  const plan = await prisma.dayNutritionPlan.findFirst({
    where: {
      id: parsed.data.planId,
      userId: session.user.id,
    },
    include: {
      items: {
        where: {
          mealType: parsed.data.mealType,
          isLogged: false,
        },
        include: {
          foodItem: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!plan || !plan.items.length) {
    revalidateNutritionPlanPaths();
    redirect(buildRedirectUrl(parsed.data.planDate));
  }

  const totals = plan.items.reduce(
    (acc, item) => {
      acc.calories += Number(item.calories);
      acc.proteinG += Number(item.proteinG);
      acc.fatG += Number(item.fatG);
      acc.carbsG += Number(item.carbsG);
      return acc;
    },
    { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 },
  );

  const mealEntry = await prisma.mealEntry.create({
    data: {
      userId: session.user.id,
      mealType: parsed.data.mealType,
      consumedAt: new Date(plan.plannedFor),
      note: "Перенесено из плана дня",
      totalCalories: new Prisma.Decimal(totals.calories),
      totalProteinG: new Prisma.Decimal(totals.proteinG),
      totalFatG: new Prisma.Decimal(totals.fatG),
      totalCarbsG: new Prisma.Decimal(totals.carbsG),
      items: {
        create: plan.items.map((item) =>
          item.foodItemId && item.foodItem
            ? {
                quantityGrams: item.quantityGrams,
                calories: item.calories,
                proteinG: item.proteinG,
                fatG: item.fatG,
                carbsG: item.carbsG,
                foodItem: {
                  connect: { id: item.foodItemId },
                },
              }
            : {
                customName: item.customName,
                quantityGrams: item.quantityGrams,
                portionCount: item.portionCount,
                calories: item.calories,
                proteinG: item.proteinG,
                fatG: item.fatG,
                carbsG: item.carbsG,
              },
        ),
      },
    },
  });

  await prisma.dayNutritionPlanItem.updateMany({
    where: {
      planId: plan.id,
      mealType: parsed.data.mealType,
      isLogged: false,
    },
    data: {
      isLogged: true,
      loggedMealEntryId: mealEntry.id,
    },
  });

  await updatePlanStatus(plan.id);
  revalidateNutritionPlanPaths();
  redirect(buildRedirectUrl(parsed.data.planDate));
}
