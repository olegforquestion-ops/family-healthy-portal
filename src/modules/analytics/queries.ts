import { prisma } from "@/lib/prisma";

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date: Date) {
  const value = startOfDay(date);
  value.setDate(value.getDate() + 1);
  return value;
}

function formatDay(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function buildDateAxis(periodDays: number, endDate = new Date()) {
  const end = startOfDay(endDate);
  const start = new Date(end);
  start.setDate(start.getDate() - (periodDays - 1));

  const days: string[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    days.push(formatDay(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    start,
    end: endOfDay(end),
    days,
  };
}

export async function getAnalyticsPageData(userId: string, periodDays: number) {
  const { start, end, days } = buildDateAxis(periodDays);

  const [meals, waters, workouts, weights, measurements] = await Promise.all([
    prisma.mealEntry.findMany({
      where: {
        userId,
        consumedAt: { gte: start, lt: end },
      },
      orderBy: { consumedAt: "asc" },
    }),
    prisma.waterEntry.findMany({
      where: {
        userId,
        recordedAt: { gte: start, lt: end },
      },
      orderBy: { recordedAt: "asc" },
    }),
    prisma.workoutEntry.findMany({
      where: {
        userId,
        performedAt: { gte: start, lt: end },
      },
      orderBy: { performedAt: "asc" },
    }),
    prisma.weightEntry.findMany({
      where: {
        userId,
        recordedAt: { gte: start, lt: end },
      },
      orderBy: { recordedAt: "asc" },
    }),
    prisma.measurementEntry.findMany({
      where: {
        userId,
        recordedAt: { gte: start, lt: end },
      },
      orderBy: { recordedAt: "asc" },
    }),
  ]);

  const nutritionByDay = new Map<string, number>();
  const waterByDay = new Map<string, number>();
  const workoutByDay = new Map<string, number>();

  for (const meal of meals) {
    const key = formatDay(meal.consumedAt);
    nutritionByDay.set(key, (nutritionByDay.get(key) ?? 0) + Number(meal.totalCalories));
  }

  for (const entry of waters) {
    const key = formatDay(entry.recordedAt);
    waterByDay.set(key, (waterByDay.get(key) ?? 0) + entry.amountMl);
  }

  for (const entry of workouts) {
    const key = formatDay(entry.performedAt);
    workoutByDay.set(key, (workoutByDay.get(key) ?? 0) + Number(entry.caloriesBurned));
  }

  const weightsByDay = new Map<string, number>();
  for (const entry of weights) {
    weightsByDay.set(formatDay(entry.recordedAt), Number(entry.weightKg));
  }

  const measurementTypes = ["WAIST", "CHEST", "HIPS", "ARM", "THIGH"] as const;
  const measurementsByDay = new Map<string, Record<string, number | null>>();
  for (const day of days) {
    measurementsByDay.set(
      day,
      measurementTypes.reduce<Record<string, number | null>>((acc, type) => {
        acc[type] = null;
        return acc;
      }, {}),
    );
  }

  for (const entry of measurements) {
    const key = formatDay(entry.recordedAt);
    const row = measurementsByDay.get(key);
    if (row) {
      row[entry.type] = Number(entry.valueCm);
    }
  }

  const dailySeries = days.map((day) => ({
    day,
    caloriesIn: nutritionByDay.get(day) ?? 0,
    waterMl: waterByDay.get(day) ?? 0,
    caloriesOut: workoutByDay.get(day) ?? 0,
    weightKg: weightsByDay.get(day) ?? null,
    ...measurementsByDay.get(day),
  }));

  const totalCaloriesIn = dailySeries.reduce((sum, item) => sum + item.caloriesIn, 0);
  const totalWaterMl = dailySeries.reduce((sum, item) => sum + item.waterMl, 0);
  const totalCaloriesOut = dailySeries.reduce((sum, item) => sum + item.caloriesOut, 0);
  const weightValues = dailySeries.filter((item) => item.weightKg !== null).map((item) => item.weightKg as number);

  return {
    periodDays,
    dailySeries,
    summary: {
      totalCaloriesIn,
      totalWaterMl,
      totalCaloriesOut,
      weightEntries: weightValues.length,
      weightDeltaKg: weightValues.length >= 2 ? weightValues[weightValues.length - 1] - weightValues[0] : null,
    },
  };
}
