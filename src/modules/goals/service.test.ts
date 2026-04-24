import test from "node:test";
import assert from "node:assert/strict";

import { calculateGoalProgress, getGoalStatus } from "@/modules/goals/service";

test("calculateGoalProgress handles target weight reduction", () => {
  const result = calculateGoalProgress(
    {
      templateCode: "TARGET_WEIGHT",
      dueDate: new Date("2026-06-01"),
      targetValue: 70,
      startValue: 80,
    },
    75,
  );

  assert.equal(result.currentValue, 75);
  assert.equal(result.progressPercent, 50);
});

test("calculateGoalProgress handles count goals", () => {
  const result = calculateGoalProgress(
    {
      templateCode: "WORKOUT_COUNT",
      dueDate: new Date("2026-06-01"),
      targetValue: 10,
      startValue: 0,
    },
    4,
  );

  assert.equal(result.progressPercent, 40);
});

test("getGoalStatus marks overdue active goals as expired", () => {
  const result = getGoalStatus({
    currentStatus: "ACTIVE",
    progressPercent: 40,
    dueDate: new Date("2026-04-01"),
    now: new Date("2026-04-24"),
  });

  assert.equal(result, "EXPIRED");
});
