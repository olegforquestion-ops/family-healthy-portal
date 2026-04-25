"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import { createWorkoutEntryAction, type WorkoutActionState } from "@/modules/workouts/actions";
import { Button } from "@/components/ui/button";

const initialState: WorkoutActionState = {};

type WorkoutNormOption = {
  id: string;
  name: string;
  unitLabel: string;
  caloriesPerUnit: string;
  defaultQuantity: string | null;
};

type WorkoutEntryFormProps = {
  norms: WorkoutNormOption[];
};

function getLocalDateTimeInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function WorkoutEntryForm({ norms }: WorkoutEntryFormProps) {
  const [state, formAction, pending] = useActionState(createWorkoutEntryAction, initialState);
  const [method, setMethod] = useState<"NORM" | "MANUAL">("NORM");
  const [selectedNormId, setSelectedNormId] = useState(norms[0]?.id ?? "");
  const [quantity, setQuantity] = useState(norms[0]?.defaultQuantity ?? "1");

  const selectedNorm = useMemo(
    () => norms.find((norm) => norm.id === selectedNormId) ?? null,
    [norms, selectedNormId],
  );

  useEffect(() => {
    setQuantity(selectedNorm?.defaultQuantity ?? "1");
  }, [selectedNormId, selectedNorm?.defaultQuantity]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="workout-method">
          Режим добавления
        </label>
        <select
          id="workout-method"
          name="method"
          value={method}
          onChange={(event) => setMethod(event.target.value as "NORM" | "MANUAL")}
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
        >
          <option value="NORM">По нормативу</option>
          <option value="MANUAL">Вручную</option>
        </select>
      </div>

      {method === "NORM" ? (
        <>
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="workout-norm">
              Норматив
            </label>
            <select
              id="workout-norm"
              name="workoutNormId"
              value={selectedNormId}
              onChange={(event) => setSelectedNormId(event.target.value)}
              className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
            >
              {norms.length ? (
                norms.map((norm) => (
                  <option key={norm.id} value={norm.id}>
                    {norm.name} / {norm.unitLabel}
                  </option>
                ))
              ) : (
                <option value="">Нет доступных нормативов</option>
              )}
            </select>
          </div>

          {selectedNorm ? (
            <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">
              {selectedNorm.name}: {selectedNorm.caloriesPerUnit} ккал за {selectedNorm.unitLabel}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="workout-quantity">
              Количество единиц
            </label>
            <input
              id="workout-quantity"
              name="quantity"
              type="number"
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
            />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="workout-activity-name">
              Название тренировки
            </label>
            <input
              id="workout-activity-name"
              name="activityName"
              placeholder="Например, силовая в зале"
              className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="workout-duration">
                Длительность, мин
              </label>
              <input
                id="workout-duration"
                name="durationMinutes"
                type="number"
                min="1"
                step="1"
                className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="workout-calories">
                Расход калорий
              </label>
              <input
                id="workout-calories"
                name="caloriesBurned"
                type="number"
                min="1"
                step="0.1"
                className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
              />
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="workout-performed-at">
          Дата и время
        </label>
        <input
          id="workout-performed-at"
          name="performedAt"
          type="datetime-local"
          defaultValue={getLocalDateTimeInputValue()}
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="workout-note">
          Комментарий
        </label>
        <input
          id="workout-note"
          name="note"
          placeholder="Например, вечерняя тренировка"
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
        />
      </div>

      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-success">{state.success}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Сохраняем..." : "Добавить тренировку"}
      </Button>
    </form>
  );
}
