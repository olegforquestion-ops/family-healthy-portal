import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteEntryButton } from "@/components/shared/delete-entry-button";
import {
  deletePlanItemAction,
  transferMealPlanSectionToFactAction,
  transferPlanItemToFactAction,
} from "@/modules/nutrition-plan/actions";
import { mealTypeLabels } from "@/modules/nutrition-plan/service";

type MealPlanSectionProps = {
  planId: string;
  planDate: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
  items: Array<{
    id: string;
    customName: string | null;
    quantityGrams: { toString(): string } | null;
    portionCount: { toString(): string } | null;
    calories: { toString(): string };
    proteinG: { toString(): string };
    fatG: { toString(): string };
    carbsG: { toString(): string };
    isLogged: boolean;
    foodItem: {
      name: string;
    } | null;
  }>;
  totals: {
    calories: number;
    proteinG: number;
    fatG: number;
    carbsG: number;
    totalItems: number;
    loggedItems: number;
  };
  addForm: React.ReactNode;
};

function getItemLabel(item: MealPlanSectionProps["items"][number]) {
  return item.foodItem?.name ?? item.customName ?? "Позиция плана";
}

function getItemQuantityLabel(item: MealPlanSectionProps["items"][number]) {
  if (item.quantityGrams) {
    return `${item.quantityGrams.toString()} г`;
  }

  if (item.portionCount) {
    return `${item.portionCount.toString()} порц.`;
  }

  return "Без количества";
}

export function MealPlanSection({ planId, planDate, mealType, items, totals, addForm }: MealPlanSectionProps) {
  const hasUnloggedItems = items.some((item) => !item.isLogged);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle>{mealTypeLabels[mealType]}</CardTitle>
          <CardDescription>
            {totals.totalItems} позиций, перенесено в факт: {totals.loggedItems}
          </CardDescription>
        </div>
        {hasUnloggedItems ? (
          <form action={transferMealPlanSectionToFactAction}>
            <input type="hidden" name="planId" value={planId} />
            <input type="hidden" name="planDate" value={planDate} />
            <input type="hidden" name="mealType" value={mealType} />
            <Button type="submit" variant="outline">
              Перенести прием пищи в факт
            </Button>
          </form>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-[1.25rem] bg-muted/60 p-4">
            <p className="text-sm text-muted-foreground">Калории</p>
            <p className="mt-2 font-display text-3xl">{totals.calories.toFixed(0)}</p>
          </div>
          <div className="rounded-[1.25rem] bg-muted/60 p-4">
            <p className="text-sm text-muted-foreground">Белки</p>
            <p className="mt-2 font-display text-3xl">{totals.proteinG.toFixed(0)}</p>
          </div>
          <div className="rounded-[1.25rem] bg-muted/60 p-4">
            <p className="text-sm text-muted-foreground">Жиры</p>
            <p className="mt-2 font-display text-3xl">{totals.fatG.toFixed(0)}</p>
          </div>
          <div className="rounded-[1.25rem] bg-muted/60 p-4">
            <p className="text-sm text-muted-foreground">Углеводы</p>
            <p className="mt-2 font-display text-3xl">{totals.carbsG.toFixed(0)}</p>
          </div>
        </div>

        {addForm}

        <div className="space-y-3">
          {items.length ? (
            items.map((item) => (
              <div key={item.id} className="rounded-[1.25rem] border border-border bg-background/70 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{getItemLabel(item)}</p>
                      <Badge variant={item.isLogged ? "success" : "secondary"}>
                        {item.isLogged ? "Перенесено" : "В плане"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{getItemQuantityLabel(item)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <span>{item.calories.toString()} ккал</span>
                    <span>Б {item.proteinG.toString()}</span>
                    <span>Ж {item.fatG.toString()}</span>
                    <span>У {item.carbsG.toString()}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  {!item.isLogged ? (
                    <form action={transferPlanItemToFactAction}>
                      <input type="hidden" name="planItemId" value={item.id} />
                      <input type="hidden" name="planDate" value={planDate} />
                      <Button type="submit" variant="outline">
                        Перенести позицию в факт
                      </Button>
                    </form>
                  ) : null}

                  <form action={deletePlanItemAction}>
                    <input type="hidden" name="planItemId" value={item.id} />
                    <input type="hidden" name="planDate" value={planDate} />
                    <DeleteEntryButton
                      confirmText={`Удалить "${getItemLabel(item)}" из плана дня?`}
                      pendingLabel="Удаляем..."
                    />
                  </form>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.25rem] bg-muted/60 p-4 text-sm text-muted-foreground">
              В этом приеме пищи пока нет позиций. Добавьте продукты из базы или ручные записи.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
