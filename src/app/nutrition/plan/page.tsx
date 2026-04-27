import Link from "next/link";

import { NutritionPlanItemForm } from "@/components/forms/nutrition-plan-item-form";
import { MealPlanSection } from "@/components/nutrition/meal-plan-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireSession } from "@/lib/session";
import { listFoodOptions } from "@/modules/foods/queries";
import { getDayNutritionPlanPageData } from "@/modules/nutrition-plan/queries";
import { orderedMealTypes } from "@/modules/nutrition-plan/service";

type NutritionPlanPageProps = {
  searchParams?: Promise<{
    date?: string;
  }>;
};

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function NutritionPlanPage({ searchParams }: NutritionPlanPageProps) {
  const session = await requireSession();
  const params = (await searchParams) ?? {};
  const selectedDate = params.date ? new Date(`${params.date}T12:00:00`) : new Date();
  const [data, foodOptions] = await Promise.all([
    getDayNutritionPlanPageData(session.user.id, selectedDate),
    listFoodOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Badge>План дня</Badge>
          <h1 className="font-display text-3xl font-semibold">План питания на день</h1>
          <p className="max-w-3xl text-muted-foreground">
            Соберите приемы пищи заранее, следите за КБЖУ в рамках дня и переносите в факт весь прием пищи или отдельные позиции по мере реального дня.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <form className="flex items-center gap-2" method="get">
            <input
              type="date"
              name="date"
              defaultValue={toDateInputValue(data.date)}
              className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
            />
            <Button type="submit" variant="outline">
              Открыть дату
            </Button>
          </form>

          <Link href={`/nutrition?date=${toDateInputValue(data.date)}`}>
            <Button variant="outline">Перейти к факту</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-none bg-[linear-gradient(160deg,rgba(252,236,197,0.96),rgba(255,255,255,0.92))]">
          <CardHeader>
            <CardTitle>Итог плана за день</CardTitle>
            <CardDescription>Дата: {data.date.toLocaleDateString("ru-RU")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-[1.25rem] bg-white/85 p-4">
                <p className="text-sm text-muted-foreground">Калории</p>
                <p className="mt-2 font-display text-4xl">{data.summary.totals.calories.toFixed(0)}</p>
              </div>
              <div className="rounded-[1.25rem] bg-white/85 p-4">
                <p className="text-sm text-muted-foreground">Белки</p>
                <p className="mt-2 font-display text-4xl">{data.summary.totals.proteinG.toFixed(0)}</p>
              </div>
              <div className="rounded-[1.25rem] bg-white/85 p-4">
                <p className="text-sm text-muted-foreground">Жиры</p>
                <p className="mt-2 font-display text-4xl">{data.summary.totals.fatG.toFixed(0)}</p>
              </div>
              <div className="rounded-[1.25rem] bg-white/85 p-4">
                <p className="text-sm text-muted-foreground">Углеводы</p>
                <p className="mt-2 font-display text-4xl">{data.summary.totals.carbsG.toFixed(0)}</p>
              </div>
            </div>

            {data.comparison ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>План по калориям</span>
                    <span>{data.comparison.caloriesPercent}%</span>
                  </div>
                  <Progress value={data.comparison.caloriesPercent} />
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="rounded-[1.25rem] bg-white/85 p-4 text-sm">
                    <p className="text-muted-foreground">Осталось калорий</p>
                    <p className="mt-2 font-semibold">{data.comparison.remainingCalories.toFixed(0)}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/85 p-4 text-sm">
                    <p className="text-muted-foreground">Осталось белков</p>
                    <p className="mt-2 font-semibold">{data.comparison.remainingProteinG.toFixed(0)}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/85 p-4 text-sm">
                    <p className="text-muted-foreground">Осталось жиров</p>
                    <p className="mt-2 font-semibold">{data.comparison.remainingFatG.toFixed(0)}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-white/85 p-4 text-sm">
                    <p className="text-muted-foreground">Осталось углеводов</p>
                    <p className="mt-2 font-semibold">{data.comparison.remainingCarbsG.toFixed(0)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[1.25rem] bg-white/85 p-4 text-sm text-muted-foreground">
                Заполните профиль и норму питания, чтобы рядом с планом видеть остаток по калориям и БЖУ.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>План и факт рядом</CardTitle>
            <CardDescription>Можно быстро оценить, где вы сейчас находитесь по сравнению с запланированным днем.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.25rem] bg-muted/60 p-4">
              <p className="text-sm text-muted-foreground">Фактически съедено сегодня</p>
              <p className="mt-2 font-display text-4xl">{data.nutritionDay.totals.calories.toFixed(0)} ккал</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Б {data.nutritionDay.totals.proteinG.toFixed(0)} / Ж {data.nutritionDay.totals.fatG.toFixed(0)} / У {data.nutritionDay.totals.carbsG.toFixed(0)}
              </p>
            </div>

            <div className="rounded-[1.25rem] bg-muted/60 p-4">
              <p className="text-sm text-muted-foreground">Статус плана</p>
              <p className="mt-2 font-semibold">
                {data.plan.status === "DRAFT"
                  ? "Черновик"
                  : data.plan.status === "PARTIALLY_LOGGED"
                    ? "Частично перенесен в факт"
                    : "Полностью перенесен в факт"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Позиций в плане: {data.summary.totals.totalItems}, уже перенесено: {data.summary.totals.loggedItems}.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {orderedMealTypes.map((mealType) => {
          const items = data.plan.items.filter((item) => item.mealType === mealType);
          const totals = data.summary.totalsByMeal[mealType];

          return (
            <MealPlanSection
              key={mealType}
              planId={data.plan.id}
              planDate={toDateInputValue(data.date)}
              mealType={mealType}
              items={items}
              totals={totals}
              addForm={
                <NutritionPlanItemForm
                  planId={data.plan.id}
                  planDate={toDateInputValue(data.date)}
                  defaultMealType={mealType}
                  foodOptions={foodOptions}
                />
              }
            />
          );
        })}
      </div>
    </div>
  );
}
