"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { requireAdminSession } from "@/lib/session";

const createUserSchema = z.object({
  displayName: z.string().min(2, "Укажите отображаемое имя."),
  login: z.string().min(3, "Логин должен быть не короче 3 символов."),
  password: z.string().min(8, "Временный пароль должен быть не короче 8 символов."),
  roleCode: z.enum(["ADMIN", "MEMBER"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type UserActionState = {
  error?: string;
};

export async function createUserAction(_prevState: UserActionState, formData: FormData): Promise<UserActionState> {
  const session = await requireAdminSession();

  const parsed = createUserSchema.safeParse({
    displayName: formData.get("displayName"),
    login: formData.get("login"),
    password: formData.get("password"),
    roleCode: formData.get("roleCode"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Проверьте форму." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { login: parsed.data.login },
  });

  if (existingUser) {
    return { error: "Пользователь с таким логином уже существует." };
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!admin) {
    return { error: "Текущий администратор не найден." };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const user = await prisma.user.create({
    data: {
      familyId: admin.familyId,
      createdById: admin.id,
      roleCode: parsed.data.roleCode,
      login: parsed.data.login,
      passwordHash,
      displayName: parsed.data.displayName,
      status: parsed.data.status,
      mustChangePassword: true,
      profile: {
        create: {
          firstName: parsed.data.displayName,
          displayName: parsed.data.displayName,
          profileGoalTypeCode: "MAINTAIN_WEIGHT",
        },
      },
    },
  });

  revalidatePath("/admin/users");
  redirect(`/admin/users?created=${user.id}`);
}
