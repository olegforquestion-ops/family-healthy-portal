import Link from "next/link";

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

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Badge variant={session.user.role === "ADMIN" ? "success" : "secondary"}>
          {session.user.role === "ADMIN" ? "Роль: администратор" : "Роль: пользователь"}
        </Badge>
        <h1 className="font-display text-3xl font-semibold">Личный обзор</h1>
        <p className="max-w-3xl text-muted-foreground">
          Здесь собраны самые важные показатели за день и неделю, чтобы было проще следить за привычками, самочувствием и текущими целями.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
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
          <CardContent className="text-3xl font-semibold">
            {currentNorm ? `${currentNorm.dailyCalories} ккал` : "Заполните профиль"}
          </CardContent>
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

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
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

            <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">
              Сожжено на тренировках сегодня: {data.workouts.totalCalories.toFixed(0)} ккал
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Прогресс по целям</CardTitle>
            <CardDescription>Помогает быстро увидеть, что уже получается хорошо, а чему стоит уделить внимание.</CardDescription>
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
              <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">
                Целей пока нет. Добавьте первую цель, чтобы видеть прогресс и маленькие победы прямо на главной странице.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Быстрые переходы</CardTitle>
          <CardDescription>Основные разделы всегда под рукой.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/goals">
            <Button>Открыть цели</Button>
          </Link>
          <Link href="/nutrition">
            <Button variant="outline">Открыть питание</Button>
          </Link>
          <Link href="/water">
            <Button variant="outline">Открыть воду</Button>
          </Link>
          <Link href="/workouts">
            <Button variant="outline">Открыть тренировки</Button>
          </Link>
          {session.user.role === "ADMIN" ? (
            <Link href="/family">
              <Button variant="outline">Открыть семейный обзор</Button>
            </Link>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
