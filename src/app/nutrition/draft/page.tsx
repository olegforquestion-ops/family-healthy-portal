import { requireSession } from "@/lib/session";
import { listFoodOptions } from "@/modules/foods/queries";
import { MealDraftForm } from "@/components/forms/meal-draft-form";
import { Badge } from "@/components/ui/badge";

export default async function MealDraftPage() {
  await requireSession();
  const foodOptions = await listFoodOptions();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge>Черновик приема пищи</Badge>
        <h1 className="font-display text-3xl font-semibold">Черновик приема пищи</h1>
        <p className="max-w-3xl text-muted-foreground">
          Выберите продукт или блюдо, укажите количество и сразу увидите, как это повлияет на дневной баланс до сохранения.
        </p>
      </div>

      <MealDraftForm foodOptions={foodOptions} />
    </div>
  );
}
