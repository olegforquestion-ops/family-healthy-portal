import { GoalForm } from "@/components/forms/goal-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireSession } from "@/lib/session";
import { getGoalsPageData } from "@/modules/goals/queries";
import { getGoalTemplateTargetLabel } from "@/modules/goals/service";

const statusLabels: Record<string, string> = {
  ACTIVE: "Активна",
  COMPLETED: "Выполнена",
  EXPIRED: "Просрочена",
  ARCHIVED: "В архиве",
};

const statusVariants: Record<string, "success" | "warning" | "secondary"> = {
  ACTIVE: "secondary",
  COMPLETED: "success",
  EXPIRED: "warning",
  ARCHIVED: "secondary",
};

export default async function GoalsPage() {
  const session = await requireSession();
  const data = await getGoalsPageData(session.user.id);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Новая цель</CardTitle>
            <CardDescription>Выберите подходящий формат и задайте удобный срок.</CardDescription>
          </CardHeader>
          <CardContent>
            <GoalForm
              templates={data.templates.map((template) => ({
                code: template.code,
                label: template.label,
                description: template.description,
                unitLabel: template.unitLabel,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Текущие цели</CardTitle>
            <CardDescription>Смотрите, сколько уже пройдено и что осталось до результата.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.goals.length ? (
              data.goals.map((goal) => (
                <div key={goal.id} className="rounded-[1.25rem] border border-border bg-background/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{goal.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{goal.goalTemplate.label}</p>
                    </div>
                    <Badge variant={statusVariants[goal.derivedStatus]}>{statusLabels[goal.derivedStatus]}</Badge>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <div>
                      {getGoalTemplateTargetLabel(goal.goalTemplateCode)}: {goal.targetValue.toString()} {goal.goalTemplate.unitLabel}
                    </div>
                    <div>
                      Текущее значение: {goal.currentValue} {goal.goalTemplate.unitLabel}
                    </div>
                    <div>Старт: {goal.startDate.toLocaleDateString("ru-RU")}</div>
                    <div>Срок: {goal.dueDate.toLocaleDateString("ru-RU")}</div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Progress value={goal.progressPercent} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{goal.progressPercent.toFixed(0)}% выполнено</span>
                      {goal.note ? <span>{goal.note}</span> : <span>{goal.goalTemplate.description}</span>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">
                Целей пока нет. Начните с одной простой цели, чтобы видеть прогресс и сохранять мотивацию.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
