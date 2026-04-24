import test from "node:test";
import assert from "node:assert/strict";

import { calculateWorkoutCaloriesByNorm, sumWorkoutCalories } from "@/modules/workouts/service";

test("calculateWorkoutCaloriesByNorm multiplies calories by quantity", () => {
  const result = calculateWorkoutCaloriesByNorm({
    caloriesPerUnit: 50,
    quantity: 3.5,
  });

  assert.equal(result, 175);
});

test("sumWorkoutCalories returns day total", () => {
  const result = sumWorkoutCalories([
    { caloriesBurned: 175 },
    { caloriesBurned: 220.4 },
    { caloriesBurned: 99.6 },
  ]);

  assert.equal(result, 495);
});
