"use client";

import { useActionState } from "react";

import { previewMealDraftAction, saveMealDraftAction, type MealDraftActionState } from "@/modules/nutrition/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type MealDraftFormProps = {
  foodOptions: Array<{
    id: string;
    name: string;
    type: "PRODUCT" | "DISH";
  }>;
};

function getLocalDateTimeInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

const initialState: MealDraftActionState = {
  form: {
    foodItemId: "",
    mealType: "LUNCH",
    quantityGrams: "100",
    consumedAt: getLocalDateTimeInputValue(),
    note: "",
  },
};

export function MealDraftForm({ foodOptions }: MealDraftFormProps) {
  const [state, previewAction, previewPending] = useActionState(previewMealDraftAction, initialState);
  const [, saveAction, savePending] = useActionState(saveMealDraftAction, state);
  const projectedPercent = state.preview?.targets
    ? Math.min(100, Math.round((state.preview.projected.calories / state.preview.targets.calories) * 100))
    : 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <Card>
        <CardHeader>
          <CardTitle>Параметры черновика</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={previewAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="foodItemId">
                Продукт или блюдо
              </label>
              <select
                id="foodItemId"
                name="foodItemId"
                defaultValue={state.form?.foodItemId || ""}
                className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
              >
                <option value="">Выберите запись</option>
                {foodOptions.map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name} ({food.type === "PRODUCT" ? "Продукт" : "Блюдо"})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor="mealType">
                  Тип приема пищи
                </label>
                <select
                  id="mealType"
                  name="mealType"
                  defaultValue={state.form?.mealType || "LUNCH"}
                  className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
                >
                  <option value="BREAKFAST">Завтрак</option>
                  <option value="LUNCH">Обед</option>
                  <option value="DINNER">Ужин</option>
                  <option value="SNACK">Перекус</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor="quantityGrams">
                  Количество, г
                </label>
                <input
                  id="quantityGrams"
                  name="quantityGrams"
                  type="number"
                  step="0.01"
                  defaultValue={state.form?.quantityGrams || "100"}
                  className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="consumedAt">
                Дата и время
              </label>
              <input
                id="consumedAt"
                name="consumedAt"
                type="datetime-local"
                defaultValue={state.form?.consumedAt || getLocalDateTimeInputValue()}
                className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="mealNote">
                Комментарий
              </label>
              <input
                id="mealNote"
                name="note"
                defaultValue={state.form?.note || ""}
                className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
              />
            </div>

            {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
            {state.success ? <p className="text-sm text-success">{state.success}</p> : null}

            <Button type="submit" disabled={previewPending}>
              {previewPending ? "Считаем..." : "Предпросмотр пересчета"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Предпросмотр плана / факта</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {state.preview ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.25rem] border border-border bg-background/70 p-4">
                  <p className="text-sm font-semibold text-muted-foreground">Сейчас за день</p>
                  <p className="mt-3 font-display text-3xl">{state.preview.current.calories} ккал</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Б {state.preview.current.proteinG} / Ж {state.preview.current.fatG} / У {state.preview.current.carbsG}
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-primary/30 bg-primary/5 p-4">
                  <p className="text-sm font-semibold text-primary">После сохранения</p>
                  <p className="mt-3 font-display text-3xl">{state.preview.projected.calories} ккал</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Б {state.preview.projected.proteinG} / Ж {state.preview.projected.fatG} / У {state.preview.projected.carbsG}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm leading-6">
                <p className="font-semibold">{state.preview.itemName}</p>
                <p className="text-muted-foreground">
                  {state.preview.mealTypeLabel}, {state.preview.quantityGrams} г
                </p>
                <p className="mt-3 text-muted-foreground">
                  Изменение: +{state.preview.delta.calories} ккал, Б +{state.preview.delta.proteinG}, Ж +{state.preview.delta.fatG}, У +{state.preview.delta.carbsG}
                </p>
              </div>

              {state.preview.targets ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Выполнение дневной нормы по калориям</span>
                    <span>{projectedPercent}%</span>
                  </div>
                  <Progress value={projectedPercent} />
                </div>
              ) : (
                <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">
                  У пользователя пока нет current nutrition snapshot. Черновик все равно показывает прогноз фактических значений за день.
                </div>
              )}

              <form action={saveAction}>
                <input type="hidden" name="foodItemId" value={state.form?.foodItemId || ""} />
                <input type="hidden" name="mealType" value={state.form?.mealType || "LUNCH"} />
                <input type="hidden" name="quantityGrams" value={state.form?.quantityGrams || ""} />
                <input type="hidden" name="consumedAt" value={state.form?.consumedAt || ""} />
                <input type="hidden" name="note" value={state.form?.note || ""} />
                <Button type="submit" disabled={savePending}>
                  {savePending ? "Сохраняем..." : "Сохранить прием пищи"}
                </Button>
              </form>
            </>
          ) : (
            <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">
              Выберите продукт, количество и время, затем откройте предпросмотр пересчета за день.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
