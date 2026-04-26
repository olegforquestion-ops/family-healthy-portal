import { DeleteEntryButton } from "@/components/shared/delete-entry-button";
import { WaterEntryForm } from "@/components/forms/water-entry-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireSession } from "@/lib/session";
import { deleteWaterEntryAction } from "@/modules/water/actions";
import { getWaterDayData } from "@/modules/water/queries";

type WaterPageProps = {
  searchParams?: Promise<{
    date?: string;
  }>;
};

export default async function WaterPage({ searchParams }: WaterPageProps) {
  const session = await requireSession();
  const params = (await searchParams) ?? {};
  const selectedDate = params.date ? new Date(`${params.date}T12:00:00`) : new Date();
  const data = await getWaterDayData(session.user.id, selectedDate);
  const progress = data.targetMl ? Math.min(100, Math.round((data.totalMl / data.targetMl) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Дата просмотра: {data.date.toLocaleDateString("ru-RU")}</p>
      </div>

      <div className="grid gap-4 lg:hidden">
        <Card className="overflow-hidden border-none bg-[linear-gradient(160deg,rgba(227,245,245,0.96),rgba(255,255,255,0.92))]">
          <CardHeader>
            <CardTitle>Прогресс по воде</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-[1.5rem] bg-white/85 p-5">
              <p className="font-display text-5xl font-semibold">{(data.totalMl / 1000).toFixed(2)} л</p>
              <p className="mt-2 text-sm text-muted-foreground">Цель: {data.targetMl ? `${(data.targetMl / 1000).toFixed(2)} л` : "не задана"}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Выполнение</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>

            <WaterEntryForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Последние записи</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.entries.length ? (
              data.entries.map((entry) => (
                <div key={entry.id} className="rounded-[1.25rem] border border-border bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{entry.amountMl} мл</p>
                      <p className="text-sm text-muted-foreground">{new Date(entry.recordedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    {entry.note ? <p className="max-w-[45%] text-right text-sm text-muted-foreground">{entry.note}</p> : null}
                  </div>
                  <form action={deleteWaterEntryAction} className="mt-3">
                    <input type="hidden" name="waterEntryId" value={entry.id} />
                    <DeleteEntryButton confirmText={`Удалить запись воды на ${entry.amountMl} мл?`} />
                  </form>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">За выбранный день записей воды пока нет. Начните с одного быстрого объема.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="hidden gap-6 xl:grid-cols-[0.9fr_1.1fr] lg:grid">
        <Card>
          <CardHeader>
            <CardTitle>Прогресс по воде</CardTitle>
            <CardDescription>Показывает, сколько уже выпито и сколько осталось до дневной цели.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-[1.25rem] bg-muted/60 p-5">
              <p className="font-display text-4xl">{(data.totalMl / 1000).toFixed(2)} л</p>
              <p className="mt-2 text-sm text-muted-foreground">Цель: {data.targetMl ? `${(data.targetMl / 1000).toFixed(2)} л` : "не задана"}</p>
            </div>

            <Progress value={progress} />

            {!data.targetMl ? (
              <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">У пользователя пока не задана норма воды. Ее можно указать в профиле, чтобы видеть процент выполнения.</div>
            ) : null}

            <WaterEntryForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Лента записей</CardTitle>
            <CardDescription>Записи сохраняются по датам, поэтому легко отслеживать привычку день за днем.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.entries.length ? (
              data.entries.map((entry) => (
                <div key={entry.id} className="rounded-[1.25rem] border border-border bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{entry.amountMl} мл</p>
                      <p className="text-sm text-muted-foreground">{new Date(entry.recordedAt).toLocaleString("ru-RU")}</p>
                    </div>
                    {entry.note ? <p className="max-w-xs text-right text-sm text-muted-foreground">{entry.note}</p> : null}
                  </div>
                  <form action={deleteWaterEntryAction} className="mt-3">
                    <input type="hidden" name="waterEntryId" value={entry.id} />
                    <DeleteEntryButton confirmText={`Удалить запись воды на ${entry.amountMl} мл?`} />
                  </form>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">За выбранный день записей воды пока нет. Добавьте первый объем через быстрые кнопки или вручную.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
