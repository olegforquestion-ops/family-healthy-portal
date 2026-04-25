"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { loginAction, type FormState } from "@/modules/auth/actions";

const initialState: FormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4 sm:space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="login">
          Логин
        </label>
        <input
          id="login"
          name="login"
          type="text"
          autoComplete="username"
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm outline-none ring-0"
          placeholder="admin"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="password">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm outline-none ring-0"
          placeholder="Введите пароль"
          required
        />
      </div>

      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}

      <Button className="w-full" type="submit" disabled={pending}>
        {pending ? "Входим..." : "Войти"}
      </Button>
    </form>
  );
}
