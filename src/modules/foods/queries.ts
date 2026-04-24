import { prisma } from "@/lib/prisma";

export async function listFoodItems() {
  return prisma.foodItem.findMany({
    where: { isActive: true },
    include: {
      createdBy: true,
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}

export async function listFoodOptions() {
  return prisma.foodItem.findMany({
    where: { isActive: true },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      type: true,
      caloriesPer100g: true,
      proteinPer100g: true,
      fatPer100g: true,
      carbsPer100g: true,
    },
  });
}
