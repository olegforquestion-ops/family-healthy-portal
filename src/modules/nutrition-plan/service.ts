import type { MealType, NutritionNormSnapshot } from "@prisma/client";

export const mealTypeLabels: Record<MealType, string> = {
  BREAKFAST: "Завтрак",
  LUNCH: "Обед",
  DINNER: "Ужин",
  SNACK: "Перекус",
};

export const orderedMealTypes: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

export function getDayStart(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function getDayEnd(date: Date) {
  const start = getDayStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return end;
}

type NumericLike = number | string | { toString(): string };

export function summarizePlanItems<
  TItem extends {
    mealType: MealType;
    calories: NumericLike;
    proteinG: NumericLike;
    fatG: NumericLike;
    carbsG: NumericLike;
    isLogged: boolean;
  },
>(items: TItem[]) {
  const totalsByMeal = Object.fromEntries(
    orderedMealTypes.map((mealType) => [
      mealType,
      {
        calories: 0,
        proteinG: 0,
        fatG: 0,
        carbsG: 0,
        totalItems: 0,
        loggedItems: 0,
      },
    ]),
  ) as Record<
    MealType,
    { calories: number; proteinG: number; fatG: number; carbsG: number; totalItems: number; loggedItems: number }
  >;

  const totals = items.reduce(
    (acc, item) => {
      const mealBucket = totalsByMeal[item.mealType];
      const calories = Number(item.calories);
      const proteinG = Number(item.proteinG);
      const fatG = Number(item.fatG);
      const carbsG = Number(item.carbsG);

      acc.calories += calories;
      acc.proteinG += proteinG;
      acc.fatG += fatG;
      acc.carbsG += carbsG;

      mealBucket.calories += calories;
      mealBucket.proteinG += proteinG;
      mealBucket.fatG += fatG;
      mealBucket.carbsG += carbsG;
      mealBucket.totalItems += 1;

      if (item.isLogged) {
        mealBucket.loggedItems += 1;
        acc.loggedItems += 1;
      }

      acc.totalItems += 1;
      return acc;
    },
    { calories: 0, proteinG: 0, fatG: 0, carbsG: 0, totalItems: 0, loggedItems: 0 },
  );

  return {
    totals: {
      ...totals,
      calories: Math.round(totals.calories * 100) / 100,
      proteinG: Math.round(totals.proteinG * 100) / 100,
      fatG: Math.round(totals.fatG * 100) / 100,
      carbsG: Math.round(totals.carbsG * 100) / 100,
    },
    totalsByMeal,
  };
}

export function buildPlanVsNorm(planTotals: { calories: number; proteinG: number; fatG: number; carbsG: number }, norm: NutritionNormSnapshot | null) {
  if (!norm) {
    return null;
  }

  return {
    caloriesPercent: Math.min(100, Math.round((planTotals.calories / norm.dailyCalories) * 100)),
    proteinPercent: Math.min(100, Math.round((planTotals.proteinG / Number(norm.proteinG)) * 100)),
    fatPercent: Math.min(100, Math.round((planTotals.fatG / Number(norm.fatG)) * 100)),
    carbsPercent: Math.min(100, Math.round((planTotals.carbsG / Number(norm.carbsG)) * 100)),
    remainingCalories: Math.round((norm.dailyCalories - planTotals.calories) * 100) / 100,
    remainingProteinG: Math.round((Number(norm.proteinG) - planTotals.proteinG) * 100) / 100,
    remainingFatG: Math.round((Number(norm.fatG) - planTotals.fatG) * 100) / 100,
    remainingCarbsG: Math.round((Number(norm.carbsG) - planTotals.carbsG) * 100) / 100,
  };
}
