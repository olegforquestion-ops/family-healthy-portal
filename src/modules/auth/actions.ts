"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";

export type FormState = {
  error?: string;
  success?: string;
};

export async function loginAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const login = String(formData.get("login") || "").trim();
  const password = String(formData.get("password") || "");

  if (!login || !password) {
    return { error: "Введите логин и пароль." };
  }

  try {
    await signIn("credentials", {
      login,
      password,
      redirectTo: "/dashboard",
    });

    return { success: "Вход выполнен." };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Неверный логин или пароль." };
    }

    throw error;
  }
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/login",
  });
}
