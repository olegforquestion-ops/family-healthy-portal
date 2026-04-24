import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: string[];
};

export function PageHeader({ eyebrow, title, description, actions = [] }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <Badge variant="secondary">{eyebrow}</Badge>
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-balance md:text-4xl">{title}</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p>
        </div>
      </div>
      {actions.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {actions.map((label, index) => (
            <Button key={label} variant={index === 0 ? "default" : "outline"}>
              {label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
