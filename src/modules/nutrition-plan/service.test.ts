import test from "node:test";
import assert from "node:assert/strict";

import { buildPlanVsNorm, summarizePlanItems } from "@/modules/nutrition-plan/service";

test("summarizePlanItems aggregates day totals and per-meal counters", () => {
  const result = summarizePlanItems([
    {
      mealType: "BREAKFAST",
      calories: 320,
      proteinG: 18,
      fatG: 10,
      carbsG: 42,
      isLogged: false,
    },
    {
      mealType: "BREAKFAST",
      calories: 180,
      proteinG: 9,
      fatG: 6,
      carbsG: 21,
      isLogged: true,
    },
    {
      mealType: "DINNER",
      calories: 540,
      proteinG: 36,
      fatG: 22,
      carbsG: 48,
      isLogged: false,
    },
  ]);

  assert.equal(result.totals.calories, 1040);
  assert.equal(result.totals.totalItems, 3);
  assert.equal(result.totals.loggedItems, 1);
  assert.equal(result.totalsByMeal.BREAKFAST.calories, 500);
  assert.equal(result.totalsByMeal.BREAKFAST.loggedItems, 1);
  assert.equal(result.totalsByMeal.DINNER.proteinG, 36);
});

test("buildPlanVsNorm returns remaining values against the target", () => {
  const result = buildPlanVsNorm(
    { calories: 1450, proteinG: 92, fatG: 48, carbsG: 135 },
    {
      dailyCalories: 2000,
      proteinG: { toString: () => "120" } as never,
      fatG: { toString: () => "70" } as never,
      carbsG: { toString: () => "220" } as never,
    } as never,
  );

  assert.equal(result?.remainingCalories, 550);
  assert.equal(result?.remainingProteinG, 28);
  assert.equal(result?.remainingFatG, 22);
  assert.equal(result?.remainingCarbsG, 85);
});
