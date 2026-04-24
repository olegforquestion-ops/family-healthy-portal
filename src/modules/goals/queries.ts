import { prisma } from "@/lib/prisma";
import { calculateGoalProgress, getGoalStatus } from "@/modules/goals/service";

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date) {
  const result = startOfDay(date);
  result.setDate(result.getDate() + 1);
  return result;
}

function getRangeEnd(date: Date) {
  const end = startOfDay(date);
  end.setDate(end.getDate() + 1);
  return end;
}

function enumerateDays(start: Date, end: Date) {
  const days: Date[] = [];
  const cursor = startOfDay(start);
  const limit = startOfDay(end);

  while (cursor.getTime() <= limit.getTime()) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

async function resolveGoalCurrentValue(goal: {
  userId: string;
  goalTemplateCode: string;
  startDate: Date;
  dueDate: Date;
}) {
  const rangeStart = startOfDay(goal.startDate);
  const rangeEnd = getRangeEnd(goal.dueDate);

  switch (goal.goalTemplateCode) {
    case "TARGET_WEIGHT": {
      const latestWeight = await prisma.weightEntry.findFirst({
        where: { userId: goal.userId },
        orderBy: { recordedAt: "desc" },
      });

      return Number(latestWeight?.weightKg ?? 0);
    }

    case "WORKOUT_COUNT": {
      return prisma.workoutEntry.count({
        where: {
          userId: goal.userId,
          performedAt: {
            gte: rangeStart,
            lt: rangeEnd,
          },
        },
      });
    }

    case "DISTANCE_KM": {
      const aggregate = await prisma.workoutEntry.aggregate({
        where: {
          userId: goal.userId,
          unitLabel: "km",
          performedAt: {
            gte: rangeStart,
            lt: rangeEnd,
          },
        },
        _sum: {
          quantity: true,
        },
      });

      return Number(aggregate._sum.quantity ?? 0);
    }

    case "CALORIE_DAYS_UNDER_TARGET": {
      const norm = await prisma.nutritionNormSnapshot.findFirst({
        where: { userId: goal.userId, isCurrent: true },
        orderBy: { calculatedAt: "desc" },
      });

      if (!norm) {
        return 0;
      }

      const meals = await prisma.mealEntry.findMany({
        where: {
          userId: goal.userId,
          consumedAt: {
            gte: rangeStart,
            lt: rangeEnd,
          },
        },
        select: {
          consumedAt: true,
          totalCalories: true,
        },
      });

      const byDay = new Map<string, number>();
      for (const meal of meals) {
        const key = startOfDay(meal.consumedAt).toISOString();
        byDay.set(key, (byDay.get(key) ?? 0) + Number(meal.totalCalories));
      }

      return enumerateDays(rangeStart, goal.dueDate).filter((day) => {
        const key = startOfDay(day).toISOString();
        return (byDay.get(key) ?? 0) > 0 && (byDay.get(key) ?? 0) <= norm.dailyCalories;
      }).length;
    }

    case "WATER_DAYS_TARGET": {
      const [norm, profile] = await Promise.all([
        prisma.nutritionNormSnapshot.findFirst({
          where: { userId: goal.userId, isCurrent: true },
          orderBy: { calculatedAt: "desc" },
        }),
        prisma.profile.findUnique({
          where: { userId: goal.userId },
          select: { waterTargetMl: true },
        }),
      ]);

      const waterTarget = norm?.waterTargetMl ?? profile?.waterTargetMl ?? 0;
      if (!waterTarget) {
        return 0;
      }

      const entries = await prisma.waterEntry.findMany({
        where: {
          userId: goal.userId,
          recordedAt: {
            gte: rangeStart,
            lt: rangeEnd,
          },
        },
        select: {
          recordedAt: true,
          amountMl: true,
        },
      });

      const byDay = new Map<string, number>();
      for (const entry of entries) {
        const key = startOfDay(entry.recordedAt).toISOString();
        byDay.set(key, (byDay.get(key) ?? 0) + entry.amountMl);
      }

      return enumerateDays(rangeStart, goal.dueDate).filter((day) => {
        const key = startOfDay(day).toISOString();
        return (byDay.get(key) ?? 0) >= waterTarget;
      }).length;
    }

    default:
      return 0;
  }
}

export async function getGoalsPageData(userId: string) {
  const [templates, goals, latestWeight, profile] = await Promise.all([
    prisma.goalTemplate.findMany({
      orderBy: { createdAt: "asc" },
    }),
    prisma.goal.findMany({
      where: {
        userId,
        status: {
          not: "ARCHIVED",
        },
      },
      include: {
        goalTemplate: true,
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    }),
    prisma.weightEntry.findFirst({
      where: { userId },
      orderBy: { recordedAt: "desc" },
    }),
    prisma.profile.findUnique({
      where: { userId },
      select: {
        profileGoalTypeCode: true,
      },
    }),
  ]);

  const goalStates = await Promise.all(
    goals.map(async (goal) => {
      const currentValue = await resolveGoalCurrentValue(goal);
      const progress = calculateGoalProgress(
        {
          templateCode: goal.goalTemplateCode,
          dueDate: goal.dueDate,
          targetValue: Number(goal.targetValue),
          startValue: goal.startValue ? Number(goal.startValue) : null,
        },
        Number(currentValue),
      );

      return {
        ...goal,
        currentValue: progress.currentValue,
        progressPercent: progress.progressPercent,
        derivedStatus: getGoalStatus({
          currentStatus: goal.status,
          progressPercent: progress.progressPercent,
          dueDate: endOfDay(goal.dueDate),
        }),
      };
    }),
  );

  return {
    templates,
    goals: goalStates,
    latestWeightKg: latestWeight ? Number(latestWeight.weightKg) : null,
    profileGoalTypeCode: profile?.profileGoalTypeCode ?? "MAINTAIN_WEIGHT",
  };
}
