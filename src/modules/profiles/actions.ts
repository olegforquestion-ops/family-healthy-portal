"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { calculateNutritionNorm } from "@/modules/nutrition/service";

const optionalPositiveNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}, z.coerce.number().positive().optional());

const optionalPositiveInt = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}, z.coerce.number().int().positive().optional());

const profileSchema = z.object({
  firstName: z.string().min(1, "Укажите имя."),
  lastName: z.string().optional(),
  displayName: z.string().min(2, "Укажите отображаемое имя."),
  dateOfBirth: z.string().optional(),
  sex: z.enum(["FEMALE", "MALE", "OTHER", "UNSPECIFIED"]),
  heightCm: z.coerce.number().positive("Рост должен быть больше нуля."),
  targetWeightKg: optionalPositiveNumber,
  activityLevel: z.enum(["LOW", "LIGHT", "MODERATE", "HIGH", "VERY_HIGH"]),
  profileGoalTypeCode: z.enum(["LOSE_WEIGHT", "SLOW_WEIGHT_LOSS", "MAINTAIN_WEIGHT", "GAIN_WEIGHT"]),
  waterTargetMl: optionalPositiveNumber,
  notes: z.string().optional(),
  currentWeightKg: z.coerce.number().positive("Текущий вес должен быть больше нуля."),
  normMode: z.enum(["AUTO", "MANUAL"]).default("AUTO"),
  manualDailyCalories: optionalPositiveInt,
  manualProteinG: optionalPositiveNumber,
  manualFatG: optionalPositiveNumber,
  manualCarbsG: optionalPositiveNumber,
});

export type ProfileActionState = {
  error?: string;
  success?: string;
};

export async function saveProfileAction(_prevState: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const session = await requireSession();

  const parsed = profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    displayName: formData.get("displayName"),
    dateOfBirth: formData.get("dateOfBirth"),
    sex: formData.get("sex"),
    heightCm: formData.get("heightCm"),
    targetWeightKg: formData.get("targetWeightKg"),
    activityLevel: formData.get("activityLevel"),
    profileGoalTypeCode: formData.get("profileGoalTypeCode"),
    waterTargetMl: formData.get("waterTargetMl"),
    notes: formData.get("notes"),
    currentWeightKg: formData.get("currentWeightKg"),
    normMode: formData.get("normMode"),
    manualDailyCalories: formData.get("manualDailyCalories"),
    manualProteinG: formData.get("manualProteinG"),
    manualFatG: formData.get("manualFatG"),
    manualCarbsG: formData.get("manualCarbsG"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Проверьте форму профиля." };
  }

  const data = parsed.data;
  const isManualNorm = data.normMode === "MANUAL";

  if (isManualNorm && (!data.manualDailyCalories || !data.manualProteinG || !data.manualFatG || !data.manualCarbsG)) {
    return { error: "Для ручного режима заполните калории, белки, жиры и углеводы." };
  }

  await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.upsert({
      where: { userId: session.user.id },
      update: {
        firstName: data.firstName,
        lastName: data.lastName || null,
        displayName: data.displayName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        sex: data.sex,
        heightCm: new Prisma.Decimal(data.heightCm),
        targetWeightKg: data.targetWeightKg ? new Prisma.Decimal(data.targetWeightKg) : null,
        activityLevel: data.activityLevel,
        profileGoalTypeCode: data.profileGoalTypeCode,
        waterTargetMl: data.waterTargetMl ?? null,
        notes: data.notes || null,
      },
      create: {
        userId: session.user.id,
        firstName: data.firstName,
        lastName: data.lastName || null,
        displayName: data.displayName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        sex: data.sex,
        heightCm: new Prisma.Decimal(data.heightCm),
        targetWeightKg: data.targetWeightKg ? new Prisma.Decimal(data.targetWeightKg) : null,
        activityLevel: data.activityLevel,
        profileGoalTypeCode: data.profileGoalTypeCode,
        waterTargetMl: data.waterTargetMl ?? null,
        notes: data.notes || null,
      },
    });

    await tx.user.update({
      where: { id: session.user.id },
      data: {
        displayName: data.displayName,
      },
    });

    await tx.weightEntry.create({
      data: {
        userId: session.user.id,
        recordedAt: new Date(),
        weightKg: new Prisma.Decimal(data.currentWeightKg),
        note: "Обновлено из профиля",
      },
    });

    const calculation = calculateNutritionNorm({
      activityLevel: profile.activityLevel,
      dateOfBirth: profile.dateOfBirth,
      heightCm: profile.heightCm,
      profileGoalTypeCode: profile.profileGoalTypeCode,
      sex: profile.sex,
      waterTargetMl: profile.waterTargetMl,
      weightKg: data.currentWeightKg,
    });

    await tx.nutritionNormSnapshot.updateMany({
      where: { userId: session.user.id, isCurrent: true },
      data: { isCurrent: false },
    });

    const snapshotData = isManualNorm
      ? {
          source: "MANUAL" as const,
          dailyCalories: data.manualDailyCalories!,
          proteinG: new Prisma.Decimal(data.manualProteinG!),
          fatG: new Prisma.Decimal(data.manualFatG!),
          carbsG: new Prisma.Decimal(data.manualCarbsG!),
          waterTargetMl: Number(data.waterTargetMl ?? calculation.waterTargetMl),
        }
      : {
          source: "AUTO" as const,
          dailyCalories: calculation.dailyCalories,
          proteinG: new Prisma.Decimal(calculation.proteinG),
          fatG: new Prisma.Decimal(calculation.fatG),
          carbsG: new Prisma.Decimal(calculation.carbsG),
          waterTargetMl: calculation.waterTargetMl,
        };

    await tx.nutritionNormSnapshot.create({
      data: {
        userId: session.user.id,
        sourceWeightKg: new Prisma.Decimal(data.currentWeightKg),
        source: snapshotData.source,
        dailyCalories: snapshotData.dailyCalories,
        proteinG: snapshotData.proteinG,
        fatG: snapshotData.fatG,
        carbsG: snapshotData.carbsG,
        waterTargetMl: snapshotData.waterTargetMl,
        isCurrent: true,
      },
    });
  });

  revalidatePath("/profile");
  revalidatePath("/measurements");
  revalidatePath("/nutrition");
  revalidatePath("/dashboard");

  return {
    success: isManualNorm ? "Профиль сохранен, ручные нормы обновлены." : "Профиль сохранен, нормы пересчитаны.",
  };
}
