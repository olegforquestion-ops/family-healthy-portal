"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { addWeightAction, type MeasurementActionState } from "@/modules/measurements/actions";

const initialState: MeasurementActionState = {};

export function WeightEntryForm() {
  const [state, formAction, pending] = useActionState(addWeightAction, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="weightKg">
          Вес, кг
        </label>
        <input id="weightKg" name="weightKg" type="number" step="0.1" required className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="weightRecordedAt">
          Дата
        </label>
        <input id="weightRecordedAt" name="recordedAt" type="date" defaultValue={today} required className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="weightNote">
          Комментарий
        </label>
        <input id="weightNote" name="note" className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <Button className="w-full sm:w-auto" type="submit" disabled={pending}>
        {pending ? "Сохраняем..." : "Добавить вес"}
      </Button>
    </form>
  );
}
