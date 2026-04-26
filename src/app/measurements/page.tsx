import { MeasurementEntryForm } from "@/components/forms/measurement-entry-form";
import { WeightEntryForm } from "@/components/forms/weight-entry-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/session";
import { getMeasurementsPageData } from "@/modules/measurements/queries";

const measurementLabels: Record<string, string> = {
  WAIST: "Талия",
  CHEST: "Грудь",
  HIPS: "Бедра",
  ARM: "Рука",
  THIGH: "Нога",
};

export default async function MeasurementsPage() {
  const session = await requireSession();
  const data = await getMeasurementsPageData(session.user.id);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Добавить вес</CardTitle>
              <CardDescription>Новая запись попадет в историю и обновит вашу динамику.</CardDescription>
            </CardHeader>
            <CardContent>
              <WeightEntryForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Добавить замер</CardTitle>
              <CardDescription>Отдельная запись для талии, груди, бедер, руки или ноги.</CardDescription>
            </CardHeader>
            <CardContent>
              <MeasurementEntryForm />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>История веса</CardTitle>
              <CardDescription>Последние записи пользователя.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="px-3 py-3">Дата</th>
                    <th className="px-3 py-3">Вес</th>
                    <th className="px-3 py-3">Комментарий</th>
                  </tr>
                </thead>
                <tbody>
                  {data.weights.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/70">
                      <td className="px-3 py-4">{new Date(entry.recordedAt).toLocaleDateString("ru-RU")}</td>
                      <td className="px-3 py-4 font-semibold">{entry.weightKg.toString()} кг</td>
                      <td className="px-3 py-4 text-muted-foreground">{entry.note ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>История замеров</CardTitle>
              <CardDescription>Последние сохраненные измерения.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="px-3 py-3">Дата</th>
                    <th className="px-3 py-3">Тип</th>
                    <th className="px-3 py-3">Значение</th>
                    <th className="px-3 py-3">Комментарий</th>
                  </tr>
                </thead>
                <tbody>
                  {data.measurements.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/70">
                      <td className="px-3 py-4">{new Date(entry.recordedAt).toLocaleDateString("ru-RU")}</td>
                      <td className="px-3 py-4">{measurementLabels[entry.type]}</td>
                      <td className="px-3 py-4 font-semibold">{entry.valueCm.toString()} см</td>
                      <td className="px-3 py-4 text-muted-foreground">{entry.note ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
