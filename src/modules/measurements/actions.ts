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

const deleteWeightSchema = z.object({
  weightEntryId: z.string().min(1, "Не удалось определить запись веса."),
});

const deleteMeasurementSchema = z.object({
  measurementEntryId: z.string().min(1, "Не удалось определить замер."),
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

  const [profile, currentNorm] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.nutritionNormSnapshot.findFirst({
      where: { userId: session.user.id, isCurrent: true },
      orderBy: { calculatedAt: "desc" },
    }),
  ]);

  await prisma.weightEntry.create({
    data: {
      userId: session.user.id,
      recordedAt: new Date(parsed.data.recordedAt),
      weightKg: new Prisma.Decimal(parsed.data.weightKg),
      note: parsed.data.note || null,
    },
  });

  if (profile?.heightCm && currentNorm?.source !== "MANUAL") {
    const calculation = calculateNutritionNorm({
      activityLevel: profile.activityLevel,
      dateOfBirth: profile.dateOfBirth,
      heightCm: profile.heightCm,
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
          source: "AUTO",
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

  return { success: currentNorm?.source === "MANUAL" ? "Вес добавлен. Ручная норма сохранена без пересчета." : "Вес добавлен." };
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

export async function deleteWeightAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const parsed = deleteWeightSchema.safeParse({
    weightEntryId: formData.get("weightEntryId"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Не удалось удалить запись веса.");
  }

  await prisma.weightEntry.deleteMany({
    where: {
      id: parsed.data.weightEntryId,
      userId: session.user.id,
    },
  });

  const [profile, currentNorm, latestWeight] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.nutritionNormSnapshot.findFirst({
      where: { userId: session.user.id, isCurrent: true },
      orderBy: { calculatedAt: "desc" },
    }),
    prisma.weightEntry.findFirst({
      where: { userId: session.user.id },
      orderBy: { recordedAt: "desc" },
    }),
  ]);

  if (profile?.heightCm && currentNorm?.source === "AUTO" && latestWeight) {
    const calculation = calculateNutritionNorm({
      activityLevel: profile.activityLevel,
      dateOfBirth: profile.dateOfBirth,
      heightCm: profile.heightCm,
      profileGoalTypeCode: profile.profileGoalTypeCode,
      sex: profile.sex,
      waterTargetMl: profile.waterTargetMl,
      weightKg: Number(latestWeight.weightKg),
    });

    await prisma.$transaction([
      prisma.nutritionNormSnapshot.updateMany({
        where: { userId: session.user.id, isCurrent: true },
        data: { isCurrent: false },
      }),
      prisma.nutritionNormSnapshot.create({
        data: {
          userId: session.user.id,
          sourceWeightKg: latestWeight.weightKg,
          source: "AUTO",
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
  revalidatePath("/dashboard");
  revalidatePath("/family");
}

export async function deleteMeasurementAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const parsed = deleteMeasurementSchema.safeParse({
    measurementEntryId: formData.get("measurementEntryId"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Не удалось удалить замер.");
  }

  await prisma.measurementEntry.deleteMany({
    where: {
      id: parsed.data.measurementEntryId,
      userId: session.user.id,
    },
  });

  revalidatePath("/measurements");
}
