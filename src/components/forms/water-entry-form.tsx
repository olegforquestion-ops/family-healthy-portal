"use client";

import { useActionState } from "react";

import { createWaterEntryAction } from "@/modules/water/actions";
import { Button } from "@/components/ui/button";

const initialState = {};

function getLocalDateTimeInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function WaterEntryForm() {
  const [state, formAction, pending] = useActionState(createWaterEntryAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3">
        {[250, 500, 750].map((amount) => (
          <Button key={amount} type="submit" name="quickAmountMl" value={amount} variant="secondary" disabled={pending}>
            + {amount} мл
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="water-amount">
            Объем, мл
          </label>
          <input
            id="water-amount"
            name="amountMl"
            type="number"
            min="1"
            step="1"
            defaultValue="250"
            className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor="water-recorded-at">
            Дата и время
          </label>
          <input
            id="water-recorded-at"
            name="recordedAt"
            type="datetime-local"
            defaultValue={getLocalDateTimeInputValue()}
            className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="water-note">
          Комментарий
        </label>
        <input
          id="water-note"
          name="note"
          placeholder="Например, после тренировки"
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
        />
      </div>

      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Сохраняем..." : "Добавить воду"}
      </Button>
    </form>
  );
}
