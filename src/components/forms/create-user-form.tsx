"use client";

import { useActionState } from "react";

import { createUserAction } from "@/modules/users/actions";
import { Button } from "@/components/ui/button";

const initialState = {};

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-semibold" htmlFor="displayName">
          Отображаемое имя
        </label>
        <input id="displayName" name="displayName" required className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="login">
          Логин
        </label>
        <input id="login" name="login" required className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="password">
          Временный пароль
        </label>
        <input id="password" name="password" type="password" required className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="roleCode">
          Роль
        </label>
        <select id="roleCode" name="roleCode" defaultValue="MEMBER" className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm">
          <option value="MEMBER">Пользователь</option>
          <option value="ADMIN">Администратор</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="status">
          Статус
        </label>
        <select id="status" name="status" defaultValue="ACTIVE" className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm">
          <option value="ACTIVE">Активен</option>
          <option value="INACTIVE">Неактивен</option>
        </select>
      </div>

      {state?.error ? <p className="text-sm text-danger md:col-span-2">{state.error}</p> : null}

      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Создаем..." : "Создать пользователя"}
        </Button>
      </div>
    </form>
  );
}
