import test from "node:test";
import assert from "node:assert/strict";

import { summarizeFamilyDashboard, summarizePersonalDashboard } from "@/modules/dashboard/service";

test("summarizePersonalDashboard calculates target percentages", () => {
  const result = summarizePersonalDashboard({
    caloriesActual: 1500,
    caloriesTarget: 2000,
    waterActual: 1800,
    waterTarget: 2400,
    workoutCalories: 320,
    activeGoals: 4,
    completedGoals: 1,
  });

  assert.equal(result.caloriesPercent, 75);
  assert.equal(result.waterPercent, 75);
  assert.equal(result.goalCompletionRate, 25);
  assert.equal(result.workoutCalories, 320);
});

test("summarizeFamilyDashboard aggregates goal completion", () => {
  const result = summarizeFamilyDashboard([
    { goalsCompleted: 1, goalsTotal: 2 },
    { goalsCompleted: 2, goalsTotal: 3 },
  ]);

  assert.equal(result.members, 2);
  assert.equal(result.goalsCompleted, 3);
  assert.equal(result.goalsTotal, 5);
  assert.equal(result.goalCompletionRate, 60);
});
