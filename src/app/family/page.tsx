import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireAdminSession } from "@/lib/session";
import { getFamilyDashboardData } from "@/modules/dashboard/queries";

export default async function FamilyPage() {
  const session = await requireAdminSession();
  const data = await getFamilyDashboardData(session.user.familyId);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="success">Семейный обзор</Badge>
        <h1 className="font-display text-3xl font-semibold">Семейная картина</h1>
        <p className="max-w-3xl text-muted-foreground">
          Здесь удобно смотреть общую ситуацию по семье: кто держит хороший темп, кому нужна поддержка и как в целом идут дела.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Активных участников</CardTitle>
            <CardDescription>Все, кто сейчас участвует в общем процессе.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{data.summary.members}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Цели завершены</CardTitle>
            <CardDescription>Сколько целей уже удалось закрыть.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{data.summary.goalsCompleted}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Всего целей</CardTitle>
            <CardDescription>Общее количество актуальных целей.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{data.summary.goalsTotal}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Общий прогресс</CardTitle>
            <CardDescription>Показывает, как движутся дела в целом.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-semibold">{data.summary.goalCompletionRate.toFixed(0)}%</div>
            <Progress value={data.summary.goalCompletionRate} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Участники семьи</CardTitle>
          <CardDescription>Краткая сводка по каждому, чтобы быстро замечать изменения и прогресс.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.users.map((user) => (
            <div key={user.userId} className="rounded-[1.4rem] border border-border bg-background/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-xl">{user.displayName}</p>
                  <p className="text-sm text-muted-foreground">{user.roleCode === "ADMIN" ? "Администратор" : "Пользователь"}</p>
                </div>
                <Badge variant={user.goalsCompleted > 0 ? "success" : "secondary"}>{user.goalsCompleted} целей</Badge>
              </div>

              <div className="mt-5 grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span>Текущий вес</span>
                  <span>{user.currentWeightKg ? `${user.currentWeightKg} кг` : "нет данных"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Калории за день</span>
                  <span>
                    {user.caloriesActual.toFixed(0)} / {user.caloriesTarget || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Вода за день</span>
                  <span>
                    {user.waterActual} / {user.waterTarget || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Активность за день</span>
                  <span>{user.workoutCalories.toFixed(0)} ккал</span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Прогресс по целям</span>
                  <span>
                    {user.goalsCompleted} / {user.goalsTotal}
                  </span>
                </div>
                <Progress value={user.goalsTotal ? (user.goalsCompleted / user.goalsTotal) * 100 : 0} />
              </div>

              {user.topGoals.length ? (
                <div className="mt-5 space-y-2">
                  {user.topGoals.map((goal) => (
                    <div key={goal.id} className="rounded-2xl bg-muted/60 p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span>{goal.title}</span>
                        <span className="text-muted-foreground">{goal.progressPercent.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl bg-muted/60 p-3 text-sm text-muted-foreground">Активных целей пока нет.</div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
