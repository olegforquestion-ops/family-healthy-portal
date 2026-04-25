"use client";

import { useActionState } from "react";

import { addMeasurementAction, type MeasurementActionState } from "@/modules/measurements/actions";
import { Button } from "@/components/ui/button";

const initialState: MeasurementActionState = {};

export function MeasurementEntryForm() {
  const [state, formAction, pending] = useActionState(addMeasurementAction, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="type">
          Тип замера
        </label>
        <select id="type" name="type" defaultValue="WAIST" className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm">
          <option value="WAIST">Талия</option>
          <option value="CHEST">Грудь</option>
          <option value="HIPS">Бедра</option>
          <option value="ARM">Рука</option>
          <option value="THIGH">Нога</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="valueCm">
          Значение, см
        </label>
        <input id="valueCm" name="valueCm" type="number" step="0.1" required className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="measurementRecordedAt">
          Дата
        </label>
        <input id="measurementRecordedAt" name="recordedAt" type="date" defaultValue={today} required className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="measurementNote">
          Комментарий
        </label>
        <input id="measurementNote" name="note" className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Сохраняем..." : "Добавить замер"}
      </Button>
    </form>
  );
}
