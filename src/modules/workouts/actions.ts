"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { assertAdmin } from "@/modules/auth/permissions";
import { calculateWorkoutCaloriesByNorm } from "@/modules/workouts/service";

function optionalStringField() {
  return z.preprocess(
    (value) => {
      if (value === null || value === undefined) {
        return undefined;
      }

      if (typeof value === "string") {
        return value;
      }

      return String(value);
    },
    z.string().optional(),
  );
}

const createWorkoutNormSchema = z.object({
  name: z.string().trim().min(2, "Укажите название норматива."),
  unitLabel: z.string().trim().min(1, "Укажите единицу измерения."),
  caloriesPerUnit: z.coerce.number().positive("Калории на единицу должны быть больше нуля."),
  defaultQuantity: optionalStringField(),
});

const createWorkoutEntrySchema = z.object({
  method: z.enum(["MANUAL", "NORM"]),
  workoutNormId: optionalStringField(),
  activityName: optionalStringField(),
  quantity: optionalStringField(),
  durationMinutes: optionalStringField(),
  caloriesBurned: optionalStringField(),
  performedAt: z.string().min(1, "Укажите дату и время."),
  note: z.preprocess(
    (value) => {
      if (value === null || value === undefined || value === "") {
        return undefined;
      }

      return value;
    },
    z.string().max(240, "Комментарий слишком длинный.").optional(),
  ),
});

export type WorkoutActionState = {
  error?: string;
  success?: string;
};

function normalizeOptionalNumber(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }

  return value;
}

function parseOptionalPositiveNumber(rawValue: string | undefined, integerOnly = false) {
  const value = rawValue?.trim();

  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  if (integerOnly && !Number.isInteger(parsed)) {
    return null;
  }

  return parsed;
}

export async function createWorkoutNormAction(
  _prevState: WorkoutActionState,
  formData: FormData,
): Promise<WorkoutActionState> {
  const session = await requireSession();
  assertAdmin(session.user.role);

  const parsed = createWorkoutNormSchema.safeParse({
    name: formData.get("name"),
    unitLabel: formData.get("unitLabel"),
    caloriesPerUnit: formData.get("caloriesPerUnit"),
    defaultQuantity: formData.get("defaultQuantity"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Проверьте форму норматива.",
    };
  }

  const existing = await prisma.workoutNorm.findFirst({
    where: {
      name: {
        equals: parsed.data.name.trim(),
        mode: "insensitive",
      },
      unitLabel: {
        equals: parsed.data.unitLabel.trim(),
        mode: "insensitive",
      },
      isActive: true,
    },
  });

  if (existing) {
    return { error: "Такой активный норматив уже существует." };
  }

  const defaultQuantity = normalizeOptionalNumber(parseOptionalPositiveNumber(parsed.data.defaultQuantity));

  if (parsed.data.defaultQuantity?.trim() && defaultQuantity === undefined) {
    return { error: "Количество по умолчанию должно быть больше нуля." };
  }

  await prisma.workoutNorm.create({
    data: {
      name: parsed.data.name.trim(),
      unitLabel: parsed.data.unitLabel.trim(),
      caloriesPerUnit: new Prisma.Decimal(parsed.data.caloriesPerUnit),
      defaultQuantity: defaultQuantity !== undefined ? new Prisma.Decimal(defaultQuantity) : null,
    },
  });

  revalidatePath("/workouts");

  return { success: "Норматив тренировки добавлен." };
}

export async function createWorkoutEntryAction(
  _prevState: WorkoutActionState,
  formData: FormData,
): Promise<WorkoutActionState> {
  const session = await requireSession();
  const parsed = createWorkoutEntrySchema.safeParse({
    method: formData.get("method"),
    workoutNormId: formData.get("workoutNormId"),
    activityName: formData.get("activityName"),
    quantity: formData.get("quantity"),
    durationMinutes: formData.get("durationMinutes"),
    caloriesBurned: formData.get("caloriesBurned"),
    performedAt: formData.get("performedAt"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Проверьте форму тренировки.",
    };
  }

  const quantity = normalizeOptionalNumber(parseOptionalPositiveNumber(parsed.data.quantity));
  const durationMinutes = normalizeOptionalNumber(parseOptionalPositiveNumber(parsed.data.durationMinutes, true));
  const manualCalories = normalizeOptionalNumber(parseOptionalPositiveNumber(parsed.data.caloriesBurned));

  if (parsed.data.quantity?.trim() && quantity === undefined) {
    return { error: "Количество должно быть больше нуля." };
  }

  if (parsed.data.durationMinutes?.trim() && durationMinutes === undefined) {
    return { error: "Длительность должна быть целым числом больше нуля." };
  }

  if (parsed.data.caloriesBurned?.trim() && manualCalories === undefined) {
    return { error: "Калории должны быть больше нуля." };
  }

  if (parsed.data.method === "NORM") {
    if (!parsed.data.workoutNormId) {
      return { error: "Выберите норматив тренировки." };
    }

    if (quantity === undefined) {
      return { error: "Укажите количество единиц по нормативу." };
    }

    const workoutNorm = await prisma.workoutNorm.findFirst({
      where: {
        id: parsed.data.workoutNormId,
        isActive: true,
      },
    });

    if (!workoutNorm) {
      return { error: "Выбранный норматив недоступен." };
    }

    const caloriesBurned = calculateWorkoutCaloriesByNorm({
      caloriesPerUnit: Number(workoutNorm.caloriesPerUnit),
      quantity,
    });

    await prisma.workoutEntry.create({
      data: {
        userId: session.user.id,
        workoutNormId: workoutNorm.id,
        method: "NORM",
        activityName: workoutNorm.name,
        unitLabel: workoutNorm.unitLabel,
        quantity: new Prisma.Decimal(quantity),
        durationMinutes: workoutNorm.unitLabel.toLowerCase() === "min" ? Math.round(quantity) : null,
        caloriesBurned: new Prisma.Decimal(caloriesBurned),
        performedAt: new Date(parsed.data.performedAt),
        note: parsed.data.note || null,
      },
    });
  } else {
    if (!parsed.data.activityName?.trim()) {
      return { error: "Укажите название тренировки." };
    }

    if (manualCalories === undefined) {
      return { error: "Укажите расход калорий." };
    }

    await prisma.workoutEntry.create({
      data: {
        userId: session.user.id,
        method: "MANUAL",
        activityName: parsed.data.activityName.trim(),
        unitLabel: durationMinutes ? "min" : null,
        quantity: durationMinutes ? new Prisma.Decimal(durationMinutes) : null,
        durationMinutes: durationMinutes ?? null,
        caloriesBurned: new Prisma.Decimal(manualCalories),
        performedAt: new Date(parsed.data.performedAt),
        note: parsed.data.note || null,
      },
    });
  }

  revalidatePath("/workouts");
  redirect(`/workouts?date=${parsed.data.performedAt.slice(0, 10)}`);
}
