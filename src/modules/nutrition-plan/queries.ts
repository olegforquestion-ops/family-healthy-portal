import { prisma } from "@/lib/prisma";
import { getNutritionDayData } from "@/modules/nutrition/queries";
import { buildPlanVsNorm, getDayStart, summarizePlanItems } from "@/modules/nutrition-plan/service";

export async function getOrCreateDayNutritionPlan(userId: string, date = new Date()) {
  const plannedFor = getDayStart(date);

  return prisma.dayNutritionPlan.upsert({
    where: {
      userId_plannedFor: {
        userId,
        plannedFor,
      },
    },
    update: {},
    create: {
      userId,
      plannedFor,
    },
    include: {
      items: {
        include: {
          foodItem: true,
          loggedMealEntry: true,
        },
        orderBy: [{ mealType: "asc" }, { createdAt: "asc" }],
      },
    },
  });
}

export async function getDayNutritionPlanPageData(userId: string, date = new Date()) {
  const [plan, nutritionDay] = await Promise.all([getOrCreateDayNutritionPlan(userId, date), getNutritionDayData(userId, date)]);
  const summary = summarizePlanItems(plan.items);

  return {
    date: getDayStart(date),
    plan,
    nutritionDay,
    summary,
    comparison: buildPlanVsNorm(summary.totals, nutritionDay.norm),
  };
}
