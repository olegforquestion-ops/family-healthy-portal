"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { createFoodAction, type FoodActionState } from "@/modules/foods/actions";

const initialState: FoodActionState = {};

export function FoodItemForm() {
  const [state, formAction, pending] = useActionState(createFoodAction, initialState);
  const [foodType, setFoodType] = useState<"PRODUCT" | "DISH">("PRODUCT");

  useEffect(() => {
    if (state.success) {
      setFoodType("PRODUCT");
    }
  }, [state.success]);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <label className="text-sm font-semibold" htmlFor="food-name">
          Название
        </label>
        <input id="food-name" name="name" required className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="food-type">
          Тип
        </label>
        <select
          id="food-type"
          name="type"
          value={foodType}
          onChange={(event) => setFoodType(event.target.value as "PRODUCT" | "DISH")}
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
        >
          <option value="PRODUCT">Продукт</option>
          <option value="DISH">Блюдо</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="food-brand">
          Бренд
        </label>
        <input id="food-brand" name="brand" className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      {foodType === "DISH" ? (
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-semibold" htmlFor="food-default-portion">
            Порция по умолчанию, г
          </label>
          <input
            id="food-default-portion"
            name="defaultPortionGrams"
            type="number"
            step="0.01"
            min="0"
            placeholder="Например, 250"
            className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
          />
          <p className="text-sm text-muted-foreground">
            Эта граммовка будет автоматически подставляться в прием пищи, но ее можно будет изменить перед сохранением.
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="food-calories">
          Ккал на 100 г
        </label>
        <input id="food-calories" name="caloriesPer100g" type="number" step="0.01" required className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="food-protein">
          Белки на 100 г
        </label>
        <input id="food-protein" name="proteinPer100g" type="number" step="0.01" required className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="food-fat">
          Жиры на 100 г
        </label>
        <input id="food-fat" name="fatPer100g" type="number" step="0.01" required className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="food-carbs">
          Углеводы на 100 г
        </label>
        <input id="food-carbs" name="carbsPer100g" type="number" step="0.01" required className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      {state?.error ? <p className="text-sm text-danger sm:col-span-2">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-success sm:col-span-2">{state.success}</p> : null}

      <div className="sm:col-span-2">
        <Button className="w-full sm:w-auto" type="submit" disabled={pending}>
          {pending ? "Сохраняем..." : "Добавить в общую базу"}
        </Button>
      </div>
    </form>
  );
}
