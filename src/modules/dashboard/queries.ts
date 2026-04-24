import { prisma } from "@/lib/prisma";
import { getGoalsPageData } from "@/modules/goals/queries";
import { summarizeFamilyDashboard, summarizePersonalDashboard } from "@/modules/dashboard/service";
import { getNutritionDayData } from "@/modules/nutrition/queries";
import { getWaterDayData } from "@/modules/water/queries";
import { getWorkoutDayData } from "@/modules/workouts/queries";

function startOfWeek(date: Date) {
  const current = new Date(date);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + diff);
  current.setHours(0, 0, 0, 0);
  return current;
}

function endOfWeek(date: Date) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return end;
}

export async function getPersonalDashboardData(userId: string, date = new Date()) {
  const [profile, nutrition, water, workouts, goals] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        nutritionNormSnapshots: {
          where: { isCurrent: true },
          orderBy: { calculatedAt: "desc" },
          take: 1,
        },
        weightEntries: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
      },
    }),
    getNutritionDayData(userId, date),
    getWaterDayData(userId, date),
    getWorkoutDayData(userId, date),
    getGoalsPageData(userId),
  ]);

  const derivedGoals = goals.goals.filter((goal) => goal.derivedStatus !== "ARCHIVED");
  const activeGoals = derivedGoals.filter((goal) => goal.derivedStatus === "ACTIVE");
  const completedGoals = derivedGoals.filter((goal) => goal.derivedStatus === "COMPLETED");
  const summary = summarizePersonalDashboard({
    caloriesActual: nutrition.totals.calories,
    caloriesTarget: nutrition.norm?.dailyCalories ?? 0,
    waterActual: water.totalMl,
    waterTarget: water.targetMl ?? 0,
    workoutCalories: workouts.totalCalories,
    activeGoals: derivedGoals.length,
    completedGoals: completedGoals.length,
  });

  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);
  const weeklyWorkoutCount = await prisma.workoutEntry.count({
    where: {
      userId,
      performedAt: {
        gte: weekStart,
        lt: weekEnd,
      },
    },
  });

  return {
    profile,
    nutrition,
    water,
    workouts,
    goals: derivedGoals,
    activeGoals,
    completedGoals,
    summary,
    weeklyWorkoutCount,
  };
}

export async function getFamilyDashboardData(familyId: string, date = new Date()) {
  const users = await prisma.user.findMany({
    where: {
      familyId,
      status: "ACTIVE",
    },
    include: {
      profile: true,
      nutritionNormSnapshots: {
        where: { isCurrent: true },
        orderBy: { calculatedAt: "desc" },
        take: 1,
      },
      weightEntries: {
        orderBy: { recordedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { displayName: "asc" },
  });

  const userCards = await Promise.all(
    users.map(async (user) => {
      const [nutrition, water, workouts, goals] = await Promise.all([
        getNutritionDayData(user.id, date),
        getWaterDayData(user.id, date),
        getWorkoutDayData(user.id, date),
        getGoalsPageData(user.id),
      ]);

      const activeGoals = goals.goals.filter((goal) => goal.derivedStatus === "ACTIVE");
      const completedGoals = goals.goals.filter((goal) => goal.derivedStatus === "COMPLETED");

      return {
        userId: user.id,
        displayName: user.displayName,
        roleCode: user.roleCode,
        currentWeightKg: user.weightEntries[0] ? Number(user.weightEntries[0].weightKg) : null,
        caloriesActual: nutrition.totals.calories,
        caloriesTarget: nutrition.norm?.dailyCalories ?? 0,
        waterActual: water.totalMl,
        waterTarget: water.targetMl ?? 0,
        workoutCalories: workouts.totalCalories,
        goalsCompleted: completedGoals.length,
        goalsTotal: goals.goals.length,
        activeGoalsCount: activeGoals.length,
        topGoals: goals.goals.slice(0, 2),
      };
    }),
  );

  return {
    summary: summarizeFamilyDashboard(userCards),
    users: userCards,
    date,
  };
}
