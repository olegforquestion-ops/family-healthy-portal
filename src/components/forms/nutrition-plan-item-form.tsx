"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { addPlanItemAction, type PlanItemFormState } from "@/modules/nutrition-plan/actions";

type NutritionPlanItemFormProps = {
  planId: string;
  planDate: string;
  defaultMealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
  foodOptions: Array<{
    id: string;
    name: string;
    type: "PRODUCT" | "DISH";
    defaultPortionGrams: { toString(): string } | null;
  }>;
};

const initialState: PlanItemFormState = {};

export function NutritionPlanItemForm({
  planId,
  planDate,
  defaultMealType,
  foodOptions,
}: NutritionPlanItemFormProps) {
  const [state, formAction, pending] = useActionState(addPlanItemAction, initialState);
  const [entryMode, setEntryMode] = useState<"CATALOG" | "MANUAL_100G" | "MANUAL_PORTION">("CATALOG");
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [quantityGrams, setQuantityGrams] = useState("100");
  const foodOptionMap = new Map(foodOptions.map((food) => [food.id, food]));

  useEffect(() => {
    if (!state.error) {
      return;
    }
  }, [state.error]);

  function handleFoodSelection(foodId: string) {
    setSelectedFoodId(foodId);

    const selectedFood = foodOptionMap.get(foodId);
    const defaultPortionGrams = selectedFood?.defaultPortionGrams ? selectedFood.defaultPortionGrams.toString() : null;

    if (defaultPortionGrams) {
      setQuantityGrams(defaultPortionGrams);
      return;
    }

    if (!foodId) {
      setQuantityGrams("100");
    }
  }

  return (
    <form action={formAction} className="space-y-4 rounded-[1.25rem] border border-border bg-background/70 p-4">
      <input type="hidden" name="planId" value={planId} />
      <input type="hidden" name="planDate" value={planDate} />
      <input type="hidden" name="mealType" value={defaultMealType} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor={`entryMode-${defaultMealType}`}>
            Способ добавления
          </label>
          <select
            id={`entryMode-${defaultMealType}`}
            name="entryMode"
            value={entryMode}
            onChange={(event) => setEntryMode(event.target.value as typeof entryMode)}
            className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
          >
            <option value="CATALOG">Из базы продуктов</option>
            <option value="MANUAL_100G">Вручную по КБЖУ на 100 г</option>
            <option value="MANUAL_PORTION">Вручную по КБЖУ на порцию</option>
          </select>
        </div>
      </div>

      {entryMode === "CATALOG" ? (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor={`foodItemId-${defaultMealType}`}>
              Продукт или блюдо
            </label>
            <select
              id={`foodItemId-${defaultMealType}`}
              name="foodItemId"
              value={selectedFoodId}
              onChange={(event) => handleFoodSelection(event.target.value)}
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
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor={`quantityGrams-${defaultMealType}`}>
              Граммовка
            </label>
            <input
              id={`quantityGrams-${defaultMealType}`}
              name="quantityGrams"
              type="number"
              step="0.01"
              value={quantityGrams}
              onChange={(event) => setQuantityGrams(event.target.value)}
              className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
            />
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor={`customName-${defaultMealType}`}>
              Название позиции
            </label>
            <input
              id={`customName-${defaultMealType}`}
              name="customName"
              placeholder="Например, бизнес-ланч в кафе"
              className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {entryMode === "MANUAL_PORTION" ? (
              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor={`portionCount-${defaultMealType}`}>
                  Количество порций
                </label>
                <input
                  id={`portionCount-${defaultMealType}`}
                  name="portionCount"
                  type="number"
                  step="0.01"
                  defaultValue="1"
                  className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-semibold" htmlFor={`manualQuantityGrams-${defaultMealType}`}>
                  Граммовка
                </label>
                <input
                  id={`manualQuantityGrams-${defaultMealType}`}
                  name="quantityGrams"
                  type="number"
                  step="0.01"
                  defaultValue="100"
                  className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor={`manualCalories-${defaultMealType}`}>
                Калории {entryMode === "MANUAL_100G" ? "на 100 г" : "на порцию"}
              </label>
              <input
                id={`manualCalories-${defaultMealType}`}
                name="manualCalories"
                type="number"
                step="0.01"
                className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor={`manualProteinG-${defaultMealType}`}>
                Белки {entryMode === "MANUAL_100G" ? "на 100 г" : "на порцию"}
              </label>
              <input
                id={`manualProteinG-${defaultMealType}`}
                name="manualProteinG"
                type="number"
                step="0.01"
                className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor={`manualFatG-${defaultMealType}`}>
                Жиры {entryMode === "MANUAL_100G" ? "на 100 г" : "на порцию"}
              </label>
              <input
                id={`manualFatG-${defaultMealType}`}
                name="manualFatG"
                type="number"
                step="0.01"
                className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor={`manualCarbsG-${defaultMealType}`}>
                Углеводы {entryMode === "MANUAL_100G" ? "на 100 г" : "на порцию"}
              </label>
              <input
                id={`manualCarbsG-${defaultMealType}`}
                name="manualCarbsG"
                type="number"
                step="0.01"
                className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
              />
            </div>
          </div>
        </>
      )}

      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}

      <Button className="w-full sm:w-auto" type="submit" disabled={pending}>
        {pending ? "Добавляем..." : "Добавить в план"}
      </Button>
    </form>
  );
}
