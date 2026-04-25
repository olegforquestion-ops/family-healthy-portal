"use client";

import { useActionState } from "react";

import { createFoodAction, type FoodActionState } from "@/modules/foods/actions";
import { Button } from "@/components/ui/button";

const initialState: FoodActionState = {};

export function FoodItemForm() {
  const [state, formAction, pending] = useActionState(createFoodAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-semibold" htmlFor="food-name">
          Название
        </label>
        <input id="food-name" name="name" required className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="food-type">
          Тип
        </label>
        <select id="food-type" name="type" defaultValue="PRODUCT" className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm">
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

      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-semibold" htmlFor="food-portion">
          Подпись порции
        </label>
        <input id="food-portion" name="portionLabel" placeholder="100 г / bowl / piece" className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

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

      {state?.error ? <p className="text-sm text-danger md:col-span-2">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-success md:col-span-2">{state.success}</p> : null}

      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Сохраняем..." : "Добавить в общую базу"}
        </Button>
      </div>
    </form>
  );
}
