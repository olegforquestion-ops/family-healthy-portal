"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

function optionalStringField() {
  return z.preprocess(
    (value) => {
      if (value === null || value === undefined || value === "") {
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

const createGoalSchema = z.object({
  goalTemplateCode: z.string().min(1, "Выберите шаблон цели."),
  title: optionalStringField(),
  targetValue: z.coerce.number().positive("Целевое значение должно быть больше нуля."),
  startDate: z.string().min(1, "Укажите дату начала."),
  dueDate: z.string().min(1, "Укажите срок выполнения."),
  note: optionalStringField(),
});

export type GoalActionState = {
  error?: string;
  success?: string;
};

function getDefaultGoalTitle(templateLabel: string, targetValue: number, dueDate: string) {
  return `${templateLabel}: ${targetValue} до ${dueDate}`;
}

export async function createGoalAction(_prevState: GoalActionState, formData: FormData): Promise<GoalActionState> {
  const session = await requireSession();
  const parsed = createGoalSchema.safeParse({
    goalTemplateCode: formData.get("goalTemplateCode"),
    title: formData.get("title"),
    targetValue: formData.get("targetValue"),
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Проверьте форму цели.",
    };
  }

  const startDate = new Date(`${parsed.data.startDate}T00:00:00`);
  const dueDate = new Date(`${parsed.data.dueDate}T23:59:59`);

  if (dueDate.getTime() < startDate.getTime()) {
    return { error: "Срок выполнения не может быть раньше даты начала." };
  }

  const [template, latestWeight, profile] = await Promise.all([
    prisma.goalTemplate.findUnique({
      where: { code: parsed.data.goalTemplateCode },
    }),
    prisma.weightEntry.findFirst({
      where: { userId: session.user.id },
      orderBy: { recordedAt: "desc" },
    }),
    prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { profileGoalTypeCode: true },
    }),
  ]);

  if (!template) {
    return { error: "Шаблон цели не найден." };
  }

  if (template.code === "TARGET_WEIGHT" && !latestWeight) {
    return { error: "Сначала зафиксируйте текущий вес, затем создавайте цель по весу." };
  }

  const startValue =
    template.code === "TARGET_WEIGHT" ? Number(latestWeight?.weightKg ?? 0) : 0;

  await prisma.goal.create({
    data: {
      userId: session.user.id,
      goalTemplateCode: template.code,
      profileGoalTypeCode: profile?.profileGoalTypeCode ?? null,
      title: parsed.data.title?.trim() || getDefaultGoalTitle(template.label, parsed.data.targetValue, parsed.data.dueDate),
      targetValue: new Prisma.Decimal(parsed.data.targetValue),
      startValue: new Prisma.Decimal(startValue),
      startDate,
      dueDate,
      note: parsed.data.note?.trim() || null,
    },
  });

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  revalidatePath("/family");

  return { success: "Цель создана." };
}
