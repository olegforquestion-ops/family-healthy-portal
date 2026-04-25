import Link from "next/link";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireSession } from "@/lib/session";
import { getNutritionDayData } from "@/modules/nutrition/queries";

const mealTypeLabels: Record<string, string> = {
  BREAKFAST: "Завтрак",
  LUNCH: "Обед",
  DINNER: "Ужин",
  SNACK: "Перекус",
};

type NutritionPageProps = {
  searchParams?: Promise<{
    date?: string;
  }>;
};

export default async function NutritionPage({ searchParams }: NutritionPageProps) {
  const session = await requireSession();
  const params = (await searchParams) ?? {};
  const selectedDate = params.date ? new Date(`${params.date}T12:00:00`) : new Date();
  const data = await getNutritionDayData(session.user.id, selectedDate);
  const caloriesPercent = data.norm?.dailyCalories ? Math.min(100, (data.totals.calories / data.norm.dailyCalories) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge>Питание</Badge>
          <h1 className="font-display text-3xl font-semibold">Питание</h1>
          <p className="hidden max-w-3xl text-muted-foreground sm:block">На телефоне здесь главное быстро занести прием пищи и сразу увидеть, как он повлиял на дневной баланс.</p>
          <p className="text-sm text-muted-foreground">Дата просмотра: {data.date.toLocaleDateString("ru-RU")}</p>
        </div>
        <Link href="/nutrition/draft">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Добавить прием пищи
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 lg:hidden">
        <Card className="overflow-hidden border-none bg-[linear-gradient(160deg,rgba(252,236,197,0.96),rgba(255,255,255,0.92))]">
          <CardHeader>
            <CardTitle>Сегодняшний баланс</CardTitle>
            <CardDescription>Быстрый ориентир без перегруженной аналитики.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.25rem] bg-white/85 p-4">
                <p className="text-sm text-muted-foreground">Калории</p>
                <p className="mt-2 font-display text-4xl font-semibold">{data.totals.calories.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">из {data.norm?.dailyCalories ?? 0} ккал</p>
              </div>
              <div className="rounded-[1.25rem] bg-white/85 p-4">
                <p className="text-sm text-muted-foreground">БЖУ</p>
                <p className="mt-2 text-sm leading-7 text-foreground">
                  Б {data.totals.proteinG.toFixed(0)} / Ж {data.totals.fatG.toFixed(0)} / У {data.totals.carbsG.toFixed(0)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Выполнение по калориям</span>
                <span>{Math.round(caloriesPercent)}%</span>
              </div>
              <Progress value={caloriesPercent} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Приемы пищи за день</CardTitle>
            <CardDescription>Сначала список, потом детали. Так мобильный экран не перегружается.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.meals.length ? (
              data.meals.map((meal) => (
                <div key={meal.id} className="rounded-[1.25rem] border border-border bg-background/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{meal.items[0]?.foodItem.name ?? "Прием пищи"}</p>
                      <p className="text-sm text-muted-foreground">
                        {mealTypeLabels[meal.mealType]} • {new Date(meal.consumedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <Badge variant="secondary">{meal.totalCalories.toString()} ккал</Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Б {meal.totalProteinG.toString()} / Ж {meal.totalFatG.toString()} / У {meal.totalCarbsG.toString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">За выбранный день записей пока нет. Начните с черновика приема пищи.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="hidden gap-6 xl:grid-cols-[0.9fr_1.1fr] lg:grid">
        <Card>
          <CardHeader>
            <CardTitle>Баланс за день</CardTitle>
            <CardDescription>Показывает, сколько уже съедено за день и как это соотносится с вашими целями.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Калории", data.totals.calories, data.norm?.dailyCalories ?? 0],
              ["Белки", data.totals.proteinG, data.norm ? Number(data.norm.proteinG) : 0],
              ["Жиры", data.totals.fatG, data.norm ? Number(data.norm.fatG) : 0],
              ["Углеводы", data.totals.carbsG, data.norm ? Number(data.norm.carbsG) : 0],
            ].map(([label, actual, target]) => (
              <div key={label as string} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{label as string}</span>
                  <span>
                    {Number(actual).toFixed(0)} / {Number(target).toFixed(0)}
                  </span>
                </div>
                <Progress value={target ? Math.min(100, (Number(actual) / Number(target)) * 100) : 0} />
              </div>
            ))}

            {!data.norm ? (
              <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">Сначала заполните профиль, чтобы рядом с фактическим питанием появились ориентиры на день.</div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Приемы пищи за выбранный день</CardTitle>
            <CardDescription>История помогает вспомнить, что и когда было добавлено в течение дня.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.meals.length ? (
              data.meals.map((meal) => (
                <div key={meal.id} className="rounded-[1.25rem] border border-border bg-background/70 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{meal.items[0]?.foodItem.name ?? "Прием пищи"}</p>
                        <Badge variant="secondary">{mealTypeLabels[meal.mealType]}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(meal.consumedAt).toLocaleString("ru-RU")}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                      <span>{meal.totalCalories.toString()} ккал</span>
                      <span>Б {meal.totalProteinG.toString()}</span>
                      <span>Ж {meal.totalFatG.toString()}</span>
                      <span>У {meal.totalCarbsG.toString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">За выбранный день записей нет. Попробуйте добавить прием пищи через черновик.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
