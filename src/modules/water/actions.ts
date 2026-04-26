"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const createWaterEntrySchema = z.object({
  amountMl: z.coerce
    .number()
    .int()
    .positive("Укажите объем воды в мл.")
    .max(5000, "Слишком большой объем для одной записи."),
  recordedAt: z.string().min(1, "Укажите дату и время."),
  note: z.string().max(240, "Комментарий слишком длинный.").optional(),
});

const deleteWaterEntrySchema = z.object({
  waterEntryId: z.string().min(1, "Не удалось определить запись воды."),
});

export type WaterEntryActionState = {
  error?: string;
  success?: string;
};

export async function createWaterEntryAction(
  _prevState: WaterEntryActionState,
  formData: FormData,
): Promise<WaterEntryActionState> {
  const session = await requireSession();
  const parsed = createWaterEntrySchema.safeParse({
    amountMl: formData.get("quickAmountMl") || formData.get("amountMl"),
    recordedAt: formData.get("recordedAt"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "Проверьте форму добавления воды.",
    };
  }

  await prisma.waterEntry.create({
    data: {
      userId: session.user.id,
      amountMl: parsed.data.amountMl,
      recordedAt: new Date(parsed.data.recordedAt),
      note: parsed.data.note || null,
    },
  });

  revalidatePath("/water");
  redirect(`/water?date=${parsed.data.recordedAt.slice(0, 10)}`);
}

export async function deleteWaterEntryAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const parsed = deleteWaterEntrySchema.safeParse({
    waterEntryId: formData.get("waterEntryId"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Не удалось удалить запись воды.");
  }

  await prisma.waterEntry.deleteMany({
    where: {
      id: parsed.data.waterEntryId,
      userId: session.user.id,
    },
  });

  revalidatePath("/water");
  revalidatePath("/dashboard");
  revalidatePath("/family");
}
