import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ShortcutItem = {
  title: string;
  body: string;
  hint: string;
};

type DailyShortcutsProps = {
  title: string;
  description: string;
  items: ShortcutItem[];
};

export function DailyShortcuts({ title, description, items }: DailyShortcutsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-[1.25rem] border border-border bg-background/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </div>
              <ArrowRight className="mt-0.5 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{item.hint}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
