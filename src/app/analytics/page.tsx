import Link from "next/link";

import { AnalyticsCharts } from "@/components/analytics/analytics-charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/session";
import { getAnalyticsPageData } from "@/modules/analytics/queries";

type AnalyticsPageProps = {
  searchParams?: Promise<{
    period?: string;
  }>;
};

const periodOptions = [7, 14, 30, 90] as const;

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const session = await requireSession();
  const params = (await searchParams) ?? {};
  const parsedPeriod = Number(params.period);
  const periodDays = periodOptions.includes(parsedPeriod as (typeof periodOptions)[number]) ? parsedPeriod : 30;
  const data = await getAnalyticsPageData(session.user.id, periodDays);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {periodOptions.map((option) => (
          <Link key={option} href={`/analytics?period=${option}`}>
            <Button variant={option === periodDays ? "default" : "outline"}>{option} дней</Button>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Съедено</CardTitle>
            <CardDescription>Сумма калорий за период.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{data.summary.totalCaloriesIn.toFixed(0)} ккал</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Выпито</CardTitle>
            <CardDescription>Сумма воды за период.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{data.summary.totalWaterMl} мл</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Сожжено</CardTitle>
            <CardDescription>Сумма тренировочной активности.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{data.summary.totalCaloriesOut.toFixed(0)} ккал</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Изменение веса</CardTitle>
            <CardDescription>Разница между первой и последней записью.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {data.summary.weightDeltaKg === null ? "—" : `${data.summary.weightDeltaKg > 0 ? "+" : ""}${data.summary.weightDeltaKg.toFixed(1)} кг`}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Динамика за период</CardTitle>
          <CardDescription>Сколько съедено, выпито, сожжено и как меняются вес и замеры по дням.</CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsCharts data={data.dailySeries} />
        </CardContent>
      </Card>
    </div>
  );
}
