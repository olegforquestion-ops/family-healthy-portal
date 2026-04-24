import test from "node:test";
import assert from "node:assert/strict";

import { calculateMealItemNutrition, calculateNutritionNorm, projectMealOntoDay } from "@/modules/nutrition/service";

test("calculateNutritionNorm returns stable calories and macros", () => {
  const result = calculateNutritionNorm({
    activityLevel: "MODERATE",
    dateOfBirth: new Date("1990-05-10"),
    heightCm: 170,
    profileGoalTypeCode: "MAINTAIN_WEIGHT",
    sex: "FEMALE",
    waterTargetMl: 2200,
    weightKg: 65,
  });

  assert.equal(result.dailyCalories > 0, true);
  assert.equal(result.proteinG > 0, true);
  assert.equal(result.fatG > 0, true);
  assert.equal(result.carbsG > 0, true);
  assert.equal(result.waterTargetMl, 2200);
});

test("calculateMealItemNutrition scales food values by quantity", () => {
  const result = calculateMealItemNutrition({
    caloriesPer100g: 200,
    proteinPer100g: 10,
    fatPer100g: 8,
    carbsPer100g: 20,
    quantityGrams: 150,
  });

  assert.deepEqual(result, {
    calories: 300,
    proteinG: 15,
    fatG: 12,
    carbsG: 30,
  });
});

test("projectMealOntoDay adds draft delta onto current totals", () => {
  const result = projectMealOntoDay(
    { calories: 1200, proteinG: 80, fatG: 40, carbsG: 110 },
    { calories: 350, proteinG: 20, fatG: 9, carbsG: 31 },
  );

  assert.deepEqual(result, {
    calories: 1550,
    proteinG: 100,
    fatG: 49,
    carbsG: 141,
  });
});
