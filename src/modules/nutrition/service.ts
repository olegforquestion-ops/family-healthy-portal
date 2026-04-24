import type { ActivityLevel, Profile, Sex } from "@prisma/client";

import { getNutritionDayData } from "@/modules/nutrition/queries";

function getAge(dateOfBirth?: Date | null) {
  if (!dateOfBirth) {
    return 30;
  }

  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDelta = today.getMonth() - dateOfBirth.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dateOfBirth.getDate())) {
    age -= 1;
  }

  return Math.max(age, 14);
}

function getSexConstant(sex: Sex) {
  switch (sex) {
    case "MALE":
      return 5;
    case "FEMALE":
      return -161;
    case "OTHER":
      return -78;
    default:
      return -78;
  }
}

function getActivityFactor(activityLevel: ActivityLevel) {
  switch (activityLevel) {
    case "LOW":
      return 1.2;
    case "LIGHT":
      return 1.375;
    case "MODERATE":
      return 1.55;
    case "HIGH":
      return 1.725;
    case "VERY_HIGH":
      return 1.9;
    default:
      return 1.55;
  }
}

function getGoalAdjustment(goalTypeCode: string) {
  switch (goalTypeCode) {
    case "LOSE_WEIGHT":
      return -450;
    case "SLOW_WEIGHT_LOSS":
      return -250;
    case "GAIN_WEIGHT":
      return 250;
    default:
      return 0;
  }
}

function getProteinFactor(goalTypeCode: string) {
  switch (goalTypeCode) {
    case "LOSE_WEIGHT":
      return 1.8;
    case "SLOW_WEIGHT_LOSS":
      return 1.7;
    case "GAIN_WEIGHT":
      return 1.8;
    default:
      return 1.6;
  }
}

export type CalculatorInput = Pick<
  Profile,
  "activityLevel" | "dateOfBirth" | "heightCm" | "profileGoalTypeCode" | "sex" | "waterTargetMl"
> & {
  weightKg: number;
};

export function calculateNutritionNorm(input: CalculatorInput) {
  const heightCm = Number(input.heightCm || 0);
  const age = getAge(input.dateOfBirth);
  const baseBmr = 10 * input.weightKg + 6.25 * heightCm - 5 * age + getSexConstant(input.sex);
  const calories = Math.max(1200, Math.round(baseBmr * getActivityFactor(input.activityLevel) + getGoalAdjustment(input.profileGoalTypeCode)));
  const proteinG = Math.round(input.weightKg * getProteinFactor(input.profileGoalTypeCode));
  const fatG = Math.max(35, Math.round((calories * 0.3) / 9));
  const carbsG = Math.max(50, Math.round((calories - proteinG * 4 - fatG * 9) / 4));
  const waterTargetMl = input.waterTargetMl ?? Math.max(1500, Math.round(input.weightKg * 30));

  return {
    dailyCalories: calories,
    proteinG,
    fatG,
    carbsG,
    waterTargetMl,
  };
}

export function calculateMealItemNutrition(input: {
  caloriesPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  carbsPer100g: number;
  quantityGrams: number;
}) {
  const factor = input.quantityGrams / 100;

  return {
    calories: Math.round(input.caloriesPer100g * factor * 100) / 100,
    proteinG: Math.round(input.proteinPer100g * factor * 100) / 100,
    fatG: Math.round(input.fatPer100g * factor * 100) / 100,
    carbsG: Math.round(input.carbsPer100g * factor * 100) / 100,
  };
}

export function projectMealOntoDay(
  current: { calories: number; proteinG: number; fatG: number; carbsG: number },
  delta: { calories: number; proteinG: number; fatG: number; carbsG: number },
) {
  return {
    calories: Math.round((current.calories + delta.calories) * 100) / 100,
    proteinG: Math.round((current.proteinG + delta.proteinG) * 100) / 100,
    fatG: Math.round((current.fatG + delta.fatG) * 100) / 100,
    carbsG: Math.round((current.carbsG + delta.carbsG) * 100) / 100,
  };
}

const mealTypeLabels: Record<string, string> = {
  BREAKFAST: "Завтрак",
  LUNCH: "Обед",
  DINNER: "Ужин",
  SNACK: "Перекус",
};

export async function calculateMealDraftPreview(input: {
  userId: string;
  foodItem: {
    caloriesPer100g: number | { toString(): string };
    proteinPer100g: number | { toString(): string };
    fatPer100g: number | { toString(): string };
    carbsPer100g: number | { toString(): string };
  };
  quantityGrams: number;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
  consumedAt: Date;
}) {
  const dayData = await getNutritionDayData(input.userId, input.consumedAt);
  const delta = calculateMealItemNutrition({
    caloriesPer100g: Number(input.foodItem.caloriesPer100g),
    proteinPer100g: Number(input.foodItem.proteinPer100g),
    fatPer100g: Number(input.foodItem.fatPer100g),
    carbsPer100g: Number(input.foodItem.carbsPer100g),
    quantityGrams: input.quantityGrams,
  });

  const current = dayData.totals;
  const projected = projectMealOntoDay(current, delta);

  return {
    mealTypeLabel: mealTypeLabels[input.mealType],
    current,
    delta,
    projected,
    targets: dayData.norm
      ? {
          calories: dayData.norm.dailyCalories,
          proteinG: Number(dayData.norm.proteinG),
          fatG: Number(dayData.norm.fatG),
          carbsG: Number(dayData.norm.carbsG),
        }
      : null,
  };
}
