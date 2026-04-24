type GoalLike = {
  dueDate: Date;
  targetValue: number;
  startValue?: number | null;
  templateCode: string;
};

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, roundToTwo(value)));
}

export function getGoalStatus(input: {
  currentStatus: "ACTIVE" | "COMPLETED" | "EXPIRED" | "ARCHIVED";
  progressPercent: number;
  dueDate: Date;
  now?: Date;
}) {
  if (input.currentStatus === "ARCHIVED") {
    return "ARCHIVED" as const;
  }

  if (input.progressPercent >= 100) {
    return "COMPLETED" as const;
  }

  const now = input.now ?? new Date();
  if (input.dueDate.getTime() < now.getTime()) {
    return "EXPIRED" as const;
  }

  return "ACTIVE" as const;
}

export function calculateGoalProgress(goal: GoalLike, currentValue: number) {
  if (goal.templateCode === "TARGET_WEIGHT") {
    const startValue = goal.startValue ?? currentValue;
    const totalDistance = Math.abs(startValue - goal.targetValue);

    if (totalDistance === 0) {
      return {
        currentValue: roundToTwo(currentValue),
        progressPercent: currentValue === goal.targetValue ? 100 : 0,
      };
    }

    const completedDistance = Math.abs(startValue - currentValue);
    return {
      currentValue: roundToTwo(currentValue),
      progressPercent: clampPercent((completedDistance / totalDistance) * 100),
    };
  }

  if (goal.targetValue <= 0) {
    return {
      currentValue: roundToTwo(currentValue),
      progressPercent: 0,
    };
  }

  return {
    currentValue: roundToTwo(currentValue),
    progressPercent: clampPercent((currentValue / goal.targetValue) * 100),
  };
}

export function calculateCompletionRate(completed: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return clampPercent((completed / total) * 100);
}

export function calculateTargetPercent(actual: number, target: number) {
  if (target <= 0) {
    return 0;
  }

  return clampPercent((actual / target) * 100);
}

export function getGoalTemplateTargetLabel(templateCode: string) {
  switch (templateCode) {
    case "TARGET_WEIGHT":
      return "Целевой вес";
    case "WORKOUT_COUNT":
      return "Тренировок";
    case "DISTANCE_KM":
      return "Километров";
    case "CALORIE_DAYS_UNDER_TARGET":
      return "Дней в норме калорий";
    case "WATER_DAYS_TARGET":
      return "Дней по воде";
    default:
      return "Цель";
  }
}
