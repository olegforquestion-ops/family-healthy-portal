"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AnalyticsChartsProps = {
  data: Array<{
    day: string;
    caloriesIn: number;
    waterMl: number;
    caloriesOut: number;
    weightKg: number | null;
    WAIST?: number | null;
    CHEST?: number | null;
    HIPS?: number | null;
    ARM?: number | null;
    THIGH?: number | null;
  }>;
};

function formatDayLabel(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  return (
    <div className="space-y-6">
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tickFormatter={formatDayLabel} />
            <YAxis />
            <Tooltip labelFormatter={formatDayLabel} />
            <Legend />
            <Line type="monotone" dataKey="caloriesIn" name="Съедено, ккал" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="caloriesOut" name="Сожжено, ккал" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tickFormatter={formatDayLabel} />
            <YAxis />
            <Tooltip labelFormatter={formatDayLabel} />
            <Legend />
            <Line type="monotone" dataKey="waterMl" name="Вода, мл" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tickFormatter={formatDayLabel} />
            <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip labelFormatter={formatDayLabel} />
            <Legend />
            <Line type="monotone" dataKey="weightKg" name="Вес, кг" stroke="hsl(var(--chart-4))" strokeWidth={2} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" tickFormatter={formatDayLabel} />
            <YAxis />
            <Tooltip labelFormatter={formatDayLabel} />
            <Legend />
            <Line type="monotone" dataKey="WAIST" name="Талия" stroke="#1f7a67" strokeWidth={2} connectNulls dot={false} />
            <Line type="monotone" dataKey="CHEST" name="Грудь" stroke="#e88b2e" strokeWidth={2} connectNulls dot={false} />
            <Line type="monotone" dataKey="HIPS" name="Бедра" stroke="#38a3d1" strokeWidth={2} connectNulls dot={false} />
            <Line type="monotone" dataKey="ARM" name="Рука" stroke="#d14f71" strokeWidth={2} connectNulls dot={false} />
            <Line type="monotone" dataKey="THIGH" name="Нога" stroke="#7b6ef6" strokeWidth={2} connectNulls dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
