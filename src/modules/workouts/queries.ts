import { sumWorkoutCalories } from "@/modules/workouts/service";
import { prisma } from "@/lib/prisma";

function getDayBounds(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export async function getWorkoutDayData(userId: string, date = new Date()) {
  const { start, end } = getDayBounds(date);

  const [norms, entries] = await Promise.all([
    prisma.workoutNorm.findMany({
      where: { isActive: true },
      orderBy: [{ name: "asc" }, { createdAt: "asc" }],
    }),
    prisma.workoutEntry.findMany({
      where: {
        userId,
        performedAt: {
          gte: start,
          lt: end,
        },
      },
      include: {
        workoutNorm: true,
      },
      orderBy: [{ performedAt: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const totalCalories = sumWorkoutCalories(entries.map((entry) => ({ caloriesBurned: Number(entry.caloriesBurned) })));

  return {
    date: start,
    norms,
    entries,
    totalCalories,
  };
}
