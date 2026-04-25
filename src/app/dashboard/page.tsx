import Link from "next/link";
import { Apple, Droplets, Dumbbell, Plus, Ruler } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireSession } from "@/lib/session";
import { getPersonalDashboardData } from "@/modules/dashboard/queries";

export default async function DashboardPage() {
  const session = await requireSession();
  const data = await getPersonalDashboardData(session.user.id);
  const currentNorm = data.profile?.nutritionNormSnapshots[0];
  const latestWeight = data.profile?.weightEntries[0];
  const recentActivity = [
    ...data.nutrition.meals.map((meal) => ({
      id: `meal-${meal.id}`,
      label: meal.items[0]?.foodItem.name ?? "Прием пищи",
      meta: `${new Date(meal.consumedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })} • ${meal.totalCalories} ккал`,
      recordedAt: new Date(meal.consumedAt).getTime(),
      type: "Питание",
    })),
    ...data.water.entries.map((entry) => ({
      id: `water-${entry.id}`,
      label: `${entry.amountMl} мл воды`,
      meta: new Date(entry.recordedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      recordedAt: new Date(entry.recordedAt).getTime(),
      type: "Вода",
    })),
    ...data.workouts.entries.map((entry) => ({
      id: `workout-${entry.id}`,
      label: entry.activityName,
      meta: `${new Date(entry.performedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })} • ${entry.caloriesBurned} ккал`,
      recordedAt: new Date(entry.performedAt).getTime(),
      type: "Тренировка",
    })),
  ]
    .sort((a, b) => b.recordedAt - a.recordedAt)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Badge variant={session.user.role === "ADMIN" ? "success" : "secondary"}>
          {session.user.role === "ADMIN" ? "Роль: администратор" : "Роль: пользователь"}
        </Badge>
        <h1 className="font-display text-3xl font-semibold">Сегодня</h1>
        <p className="hidden max-w-3xl text-muted-foreground sm:block">Главный экран для телефона: быстро занести еду, воду и тренировку, а затем сразу увидеть картину дня.</p>
      </div>

      <div className="grid gap-4 lg:hidden">
        <Card className="overflow-hidden border-none bg-[linear-gradient(160deg,rgba(252,236,197,0.96),rgba(255,255,255,0.92))]">
          <CardHeader>
            <CardTitle>Быстрые действия дня</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link href="/nutrition/draft" className="rounded-[1.25rem] border border-white/80 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <Apple className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Добавить еду</p>
                  <p className="text-sm text-muted-foreground">Черновик приема пищи</p>
                </div>
              </div>
            </Link>
            <Link href="/water" className="rounded-[1.25rem] border border-white/80 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <Droplets className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Добавить воду</p>
                  <p className="text-sm text-muted-foreground">Быстрые объемы и итог дня</p>
                </div>
              </div>
            </Link>
            <Link href="/workouts" className="rounded-[1.25rem] border border-white/80 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <Dumbbell className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Добавить тренировку</p>
                  <p className="text-sm text-muted-foreground">По нормативу или вручную</p>
                </div>
              </div>
            </Link>
            <Link href="/measurements" className="rounded-[1.25rem] border border-white/80 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <Ruler className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">Вес и замеры</p>
                  <p className="text-sm text-muted-foreground">Быстрая фиксация прогресса</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="space-y-1 pt-4">
              <p className="text-sm text-muted-foreground">Калории</p>
              <p className="font-display text-3xl font-semibold">{data.nutrition.totals.calories.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">из {currentNorm ? `${currentNorm.dailyCalories} ккал` : "без цели"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-1 pt-4">
              <p className="text-sm text-muted-foreground">Вода</p>
              <p className="font-display text-3xl font-semibold">{data.water.totalMl}</p>
              <p className="text-sm text-muted-foreground">из {data.water.targetMl ?? 0} мл</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-1 pt-4">
              <p className="text-sm text-muted-foreground">Тренировки</p>
              <p className="font-display text-3xl font-semibold">{data.workouts.entries.length}</p>
              <p className="text-sm text-muted-foreground">{data.workouts.totalCalories.toFixed(0)} ккал</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Прогресс за день</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Калории", data.nutrition.totals.calories, data.nutrition.norm?.dailyCalories ?? 0, data.summary.caloriesPercent],
              ["Вода", data.water.totalMl, data.water.targetMl ?? 0, data.summary.waterPercent],
            ].map(([label, actual, target, percent]) => (
              <div key={label as string} className="space-y-2">
                <div className="flex justify-between gap-4 text-sm">
                  <span>{label as string}</span>
                  <span>
                    {Number(actual).toFixed(0)} / {Number(target).toFixed(0)}
                  </span>
                </div>
                <Progress value={Number(percent)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Последние действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.length ? (
              recentActivity.map((item) => (
                <div key={item.id} className="rounded-[1.25rem] bg-muted/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.meta}</p>
                    </div>
                    <Badge variant="secondary">{item.type}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">За сегодня пока нет записей. Начните с еды, воды или тренировки.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="hidden gap-4 sm:grid-cols-2 2xl:grid-cols-4 lg:grid lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Текущий вес</CardTitle>
            <CardDescription>Последняя сохраненная запись.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{latestWeight ? `${latestWeight.weightKg} кг` : "Нет данных"}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Норма калорий</CardTitle>
            <CardDescription>Рекомендуемый ориентир на день.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{currentNorm ? `${currentNorm.dailyCalories} ккал` : "Заполните профиль"}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Норма воды</CardTitle>
            <CardDescription>Сколько воды стоит выпивать за день.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{data.water.targetMl ? `${data.water.targetMl} мл` : "Нет данных"}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Тренировки недели</CardTitle>
            <CardDescription>Сколько занятий уже было на этой неделе.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{data.weeklyWorkoutCount}</CardContent>
        </Card>
      </div>

      <div className="hidden gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Сегодняшний день</CardTitle>
            <CardDescription>Помогает быстро понять, насколько вы близки к своим привычным ориентирам.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Калории", data.nutrition.totals.calories, data.nutrition.norm?.dailyCalories ?? 0, data.summary.caloriesPercent],
              ["Вода", data.water.totalMl, data.water.targetMl ?? 0, data.summary.waterPercent],
            ].map(([label, actual, target, percent]) => (
              <div key={label as string} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{label as string}</span>
                  <span>
                    {Number(actual).toFixed(0)} / {Number(target).toFixed(0)}
                  </span>
                </div>
                <Progress value={Number(percent)} />
              </div>
            ))}

            <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">Сожжено на тренировках сегодня: {data.workouts.totalCalories.toFixed(0)} ккал</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Прогресс по целям</CardTitle>
            <CardDescription>Быстрый обзор текущих и завершенных целей.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.25rem] bg-muted/60 p-4">
              <div className="flex justify-between text-sm">
                <span>Выполнено целей</span>
                <span>
                  {data.completedGoals.length} / {data.goals.length}
                </span>
              </div>
              <div className="mt-3">
                <Progress value={data.summary.goalCompletionRate} />
              </div>
            </div>

            {data.goals.length ? (
              data.goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="rounded-[1.25rem] border border-border bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{goal.title}</p>
                      <p className="text-sm text-muted-foreground">{goal.goalTemplate.label}</p>
                    </div>
                    <Badge variant={goal.derivedStatus === "COMPLETED" ? "success" : goal.derivedStatus === "EXPIRED" ? "warning" : "secondary"}>
                      {goal.progressPercent.toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <Progress value={goal.progressPercent} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">Целей пока нет. Добавьте первую цель, чтобы видеть прогресс на главной.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle>Быстрые переходы</CardTitle>
          <CardDescription>Основные разделы всегда под рукой.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/nutrition/draft">
            <Button>
              <Plus className="h-4 w-4" />
              Добавить прием пищи
            </Button>
          </Link>
          <Link href="/water">
            <Button variant="outline">Открыть воду</Button>
          </Link>
          <Link href="/workouts">
            <Button variant="outline">Открыть тренировки</Button>
          </Link>
          <Link href="/measurements">
            <Button variant="outline">Вес и замеры</Button>
          </Link>
          {session.user.role === "ADMIN" ? (
            <Link href="/family">
              <Button variant="outline">Семейный обзор</Button>
            </Link>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
