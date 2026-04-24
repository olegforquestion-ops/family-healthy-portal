import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutEntryForm } from "@/components/forms/workout-entry-form";
import { WorkoutNormForm } from "@/components/forms/workout-norm-form";
import { requireSession } from "@/lib/session";
import { getWorkoutDayData } from "@/modules/workouts/queries";

const methodLabels: Record<string, string> = {
  MANUAL: "Вручную",
  NORM: "По нормативу",
};

type WorkoutsPageProps = {
  searchParams?: Promise<{
    date?: string;
  }>;
};

export default async function WorkoutsPage({ searchParams }: WorkoutsPageProps) {
  const session = await requireSession();
  const params = (await searchParams) ?? {};
  const selectedDate = params.date ? new Date(`${params.date}T12:00:00`) : new Date();
  const data = await getWorkoutDayData(session.user.id, selectedDate);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge>Тренировки</Badge>
        <h1 className="font-display text-3xl font-semibold">Тренировки</h1>
        <p className="max-w-3xl text-muted-foreground">
          Здесь можно быстро добавить тренировку вручную или выбрать готовый вариант из списка, чтобы видеть свою активность за день.
        </p>
        <p className="text-sm text-muted-foreground">Дата просмотра: {data.date.toLocaleDateString("ru-RU")}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Итог за день</CardTitle>
              <CardDescription>Быстрый обзор по всем сохраненным тренировкам за выбранную дату.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.25rem] bg-muted/60 p-5">
                  <p className="font-display text-4xl">{data.totalCalories.toFixed(0)}</p>
                  <p className="mt-2 text-sm text-muted-foreground">ккал сожжено</p>
                </div>
                <div className="rounded-[1.25rem] bg-muted/60 p-5">
                  <p className="font-display text-4xl">{data.entries.length}</p>
                  <p className="mt-2 text-sm text-muted-foreground">тренировок за день</p>
                </div>
              </div>

              <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">
                Для каждой тренировки сохраняется способ добавления, объем и расход калорий.
              </div>

              <WorkoutEntryForm
                norms={data.norms.map((norm) => ({
                  id: norm.id,
                  name: norm.name,
                  unitLabel: norm.unitLabel,
                  caloriesPerUnit: norm.caloriesPerUnit.toString(),
                  defaultQuantity: norm.defaultQuantity?.toString() ?? null,
                }))}
              />
            </CardContent>
          </Card>

          {session.user.role === "ADMIN" ? (
            <Card>
              <CardHeader>
                <CardTitle>Добавить вариант активности</CardTitle>
                <CardDescription>Администратор может дополнять общий список вариантов активности.</CardDescription>
              </CardHeader>
              <CardContent>
                <WorkoutNormForm />
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>История тренировок</CardTitle>
              <CardDescription>Здесь видно, что именно было сделано и какой результат это дало.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.entries.length ? (
                data.entries.map((entry) => (
                  <div key={entry.id} className="rounded-[1.25rem] border border-border bg-background/70 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{entry.activityName}</p>
                          <Badge variant="secondary">{methodLabels[entry.method]}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(entry.performedAt).toLocaleString("ru-RU")}</p>
                        {entry.quantity && entry.unitLabel ? (
                          <p className="text-sm text-muted-foreground">
                            Объем: {entry.quantity.toString()} {entry.unitLabel}
                          </p>
                        ) : null}
                        {entry.note ? <p className="text-sm text-muted-foreground">{entry.note}</p> : null}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{entry.caloriesBurned.toString()} ккал</p>
                        {entry.durationMinutes ? <p className="text-sm text-muted-foreground">{entry.durationMinutes} мин</p> : null}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">
                  За выбранный день тренировок пока нет. Можно добавить запись вручную или выбрать готовый вариант.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Готовые варианты</CardTitle>
              <CardDescription>Выберите подходящий вариант, чтобы не вводить одни и те же данные заново.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.norms.map((norm) => (
                <div key={norm.id} className="flex items-center justify-between rounded-[1.25rem] bg-muted/60 p-4">
                  <div>
                    <p className="font-semibold">{norm.name}</p>
                    <p className="text-sm text-muted-foreground">За {norm.unitLabel}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{norm.caloriesPerUnit.toString()} ккал</p>
                    {norm.defaultQuantity ? (
                      <p className="text-sm text-muted-foreground">По умолчанию: {norm.defaultQuantity.toString()}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
