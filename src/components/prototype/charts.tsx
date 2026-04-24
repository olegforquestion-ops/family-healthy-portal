"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type TrendChartProps = {
  title: string;
  description: string;
  data: Array<Record<string, string | number>>;
  kind: "line" | "bar";
  dataKeys: { key: string; color: string; name: string }[];
};

export function TrendChart({ title, description, data, kind, dataKeys }: TrendChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {kind === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(108, 117, 125, 0.18)" />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              {dataKeys.map((entry) => (
                <Line key={entry.key} dataKey={entry.key} stroke={entry.color} strokeWidth={3} dot={{ r: 3 }} name={entry.name} />
              ))}
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(108, 117, 125, 0.18)" />
              <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              {dataKeys.map((entry) => (
                <Bar key={entry.key} dataKey={entry.key} fill={entry.color} radius={[8, 8, 0, 0]} name={entry.name} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
