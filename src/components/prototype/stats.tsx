import { ArrowDown, ArrowUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  trend?: "up" | "down" | "steady";
};

export function StatCard({ label, value, hint, trend = "steady" }: StatCardProps) {
  const trendIcon = trend === "up" ? <ArrowUp className="h-4 w-4" /> : trend === "down" ? <ArrowDown className="h-4 w-4" /> : null;
  const trendVariant = trend === "up" ? "success" : trend === "down" ? "warning" : "secondary";

  return (
    <Card className="h-full">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          <Badge variant={trendVariant}>{trend === "steady" ? "Сегодня" : trendIcon}</Badge>
        </div>
        <div className="font-display text-3xl font-semibold">{value}</div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
