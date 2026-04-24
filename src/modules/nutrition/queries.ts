import { prisma } from "@/lib/prisma";

function getDayBounds(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export async function getNutritionDayData(userId: string, date = new Date()) {
  const { start, end } = getDayBounds(date);

  const [norm, meals] = await Promise.all([
    prisma.nutritionNormSnapshot.findFirst({
      where: { userId, isCurrent: true },
      orderBy: { calculatedAt: "desc" },
    }),
    prisma.mealEntry.findMany({
      where: {
        userId,
        consumedAt: {
          gte: start,
          lt: end,
        },
      },
      include: {
        items: {
          include: {
            foodItem: true,
          },
        },
      },
      orderBy: [{ consumedAt: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const totals = meals.reduce(
    (acc, meal) => {
      acc.calories += Number(meal.totalCalories);
      acc.proteinG += Number(meal.totalProteinG);
      acc.fatG += Number(meal.totalFatG);
      acc.carbsG += Number(meal.totalCarbsG);
      return acc;
    },
    { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 },
  );

  return {
    date: start,
    norm,
    meals,
    totals,
  };
}
