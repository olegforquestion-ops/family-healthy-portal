"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const createFoodSchema = z.object({
  name: z.string().min(2, "Укажите название продукта или блюда."),
  type: z.enum(["PRODUCT", "DISH"]),
  brand: z.string().optional(),
  portionLabel: z.string().optional(),
  caloriesPer100g: z.coerce.number().min(0, "Калории не могут быть отрицательными."),
  proteinPer100g: z.coerce.number().min(0, "Белки не могут быть отрицательными."),
  fatPer100g: z.coerce.number().min(0, "Жиры не могут быть отрицательными."),
  carbsPer100g: z.coerce.number().min(0, "Углеводы не могут быть отрицательными."),
});

const deleteFoodSchema = z.object({
  foodId: z.string().min(1, "Не удалось определить запись для удаления."),
});

export type FoodActionState = {
  error?: string;
  success?: string;
};

export async function createFoodAction(_prevState: FoodActionState, formData: FormData): Promise<FoodActionState> {
  const session = await requireSession();

  const parsed = createFoodSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    brand: formData.get("brand"),
    portionLabel: formData.get("portionLabel"),
    caloriesPer100g: formData.get("caloriesPer100g"),
    proteinPer100g: formData.get("proteinPer100g"),
    fatPer100g: formData.get("fatPer100g"),
    carbsPer100g: formData.get("carbsPer100g"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Проверьте форму продукта." };
  }

  await prisma.foodItem.create({
    data: {
      createdById: session.user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      brand: parsed.data.brand || null,
      portionLabel: parsed.data.portionLabel || null,
      caloriesPer100g: new Prisma.Decimal(parsed.data.caloriesPer100g),
      proteinPer100g: new Prisma.Decimal(parsed.data.proteinPer100g),
      fatPer100g: new Prisma.Decimal(parsed.data.fatPer100g),
      carbsPer100g: new Prisma.Decimal(parsed.data.carbsPer100g),
    },
  });

  revalidatePath("/foods");
  revalidatePath("/nutrition/draft");

  return { success: "Запись добавлена в общую базу продуктов." };
}

export async function deleteFoodAction(formData: FormData): Promise<void> {
  await requireSession();

  const parsed = deleteFoodSchema.safeParse({
    foodId: formData.get("foodId"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Не удалось удалить запись.");
  }

  await prisma.foodItem.update({
    where: { id: parsed.data.foodId },
    data: {
      isActive: false,
    },
  });

  revalidatePath("/foods");
  revalidatePath("/nutrition/draft");
}
