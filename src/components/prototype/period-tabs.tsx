import { cn } from "@/lib/utils";

type PeriodTabsProps = {
  items: string[];
  active: string;
};

export function PeriodTabs({ items, active }: PeriodTabsProps) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-full border border-border bg-card/80 p-1">
      {items.map((item) => (
        <span
          key={item}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            item === active ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
