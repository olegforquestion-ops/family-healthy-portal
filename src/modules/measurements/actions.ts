"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { calculateNutritionNorm } from "@/modules/nutrition/service";

const weightSchema = z.object({
  weightKg: z.coerce.number().positive("Вес должен быть больше нуля."),
  recordedAt: z.string().min(1, "Укажите дату."),
  note: z.string().optional(),
});

const measurementSchema = z.object({
  type: z.enum(["WAIST", "CHEST", "HIPS", "ARM", "THIGH"]),
  valueCm: z.coerce.number().positive("Значение должно быть больше нуля."),
  recordedAt: z.string().min(1, "Укажите дату."),
  note: z.string().optional(),
});

export type MeasurementActionState = {
  error?: string;
  success?: string;
};

export async function addWeightAction(_prevState: MeasurementActionState, formData: FormData): Promise<MeasurementActionState> {
  const session = await requireSession();

  const parsed = weightSchema.safeParse({
    weightKg: formData.get("weightKg"),
    recordedAt: formData.get("recordedAt"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Проверьте форму веса." };
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  await prisma.weightEntry.create({
    data: {
      userId: session.user.id,
      recordedAt: new Date(parsed.data.recordedAt),
      weightKg: new Prisma.Decimal(parsed.data.weightKg),
      note: parsed.data.note || null,
    },
  });

  if (profile?.heightCm) {
    const calculation = calculateNutritionNorm({
      activityLevel: profile.activityLevel,
      dateOfBirth: profile.dateOfBirth,
      heightCm: Number(profile.heightCm),
      profileGoalTypeCode: profile.profileGoalTypeCode,
      sex: profile.sex,
      waterTargetMl: profile.waterTargetMl,
      weightKg: parsed.data.weightKg,
    });

    await prisma.$transaction([
      prisma.nutritionNormSnapshot.updateMany({
        where: { userId: session.user.id, isCurrent: true },
        data: { isCurrent: false },
      }),
      prisma.nutritionNormSnapshot.create({
        data: {
          userId: session.user.id,
          sourceWeightKg: new Prisma.Decimal(parsed.data.weightKg),
          dailyCalories: calculation.dailyCalories,
          proteinG: new Prisma.Decimal(calculation.proteinG),
          fatG: new Prisma.Decimal(calculation.fatG),
          carbsG: new Prisma.Decimal(calculation.carbsG),
          waterTargetMl: calculation.waterTargetMl,
          isCurrent: true,
        },
      }),
    ]);
  }

  revalidatePath("/measurements");
  revalidatePath("/profile");

  return { success: "Вес добавлен." };
}

export async function addMeasurementAction(
  _prevState: MeasurementActionState,
  formData: FormData,
): Promise<MeasurementActionState> {
  const session = await requireSession();

  const parsed = measurementSchema.safeParse({
    type: formData.get("type"),
    valueCm: formData.get("valueCm"),
    recordedAt: formData.get("recordedAt"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Проверьте форму замера." };
  }

  await prisma.measurementEntry.create({
    data: {
      userId: session.user.id,
      type: parsed.data.type,
      valueCm: new Prisma.Decimal(parsed.data.valueCm),
      recordedAt: new Date(parsed.data.recordedAt),
      note: parsed.data.note || null,
    },
  });

  revalidatePath("/measurements");

  return { success: "Замер добавлен." };
}
