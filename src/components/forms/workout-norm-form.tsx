"use client";

import { useActionState } from "react";

import { createWorkoutNormAction } from "@/modules/workouts/actions";
import { Button } from "@/components/ui/button";

const initialState = {};

export function WorkoutNormForm() {
  const [state, formAction, pending] = useActionState(createWorkoutNormAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-semibold" htmlFor="workout-norm-name">
          Название
        </label>
        <input
          id="workout-norm-name"
          name="name"
          placeholder="Например, Эллипс"
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="workout-norm-unit">
          Единица
        </label>
        <input
          id="workout-norm-unit"
          name="unitLabel"
          placeholder="min / km / repetition"
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="workout-norm-calories">
          Ккал за единицу
        </label>
        <input
          id="workout-norm-calories"
          name="caloriesPerUnit"
          type="number"
          min="0.1"
          step="0.1"
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-semibold" htmlFor="workout-norm-default-quantity">
          Количество по умолчанию
        </label>
        <input
          id="workout-norm-default-quantity"
          name="defaultQuantity"
          type="number"
          min="0.1"
          step="0.1"
          placeholder="Необязательно"
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
        />
      </div>

      {state?.error ? <p className="text-sm text-danger md:col-span-2">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-success md:col-span-2">{state.success}</p> : null}

      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Сохраняем..." : "Добавить норматив"}
        </Button>
      </div>
    </form>
  );
}
