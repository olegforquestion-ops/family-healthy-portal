import { Badge } from "@/components/ui/badge";
import { MealDraftForm } from "@/components/forms/meal-draft-form";
import { requireSession } from "@/lib/session";
import { listFoodOptions } from "@/modules/foods/queries";

export default async function MealDraftPage() {
  await requireSession();
  const foodOptions = await listFoodOptions();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge>Черновик приема пищи</Badge>
        <h1 className="font-display text-3xl font-semibold">Черновик приема пищи</h1>
        <p className="max-w-3xl text-muted-foreground">
          Можно выбрать запись из базы или ввести КБЖУ вручную, если это разовый прием пищи вне вашей постоянной базы
          продуктов.
        </p>
      </div>

      <MealDraftForm foodOptions={foodOptions} />
    </div>
  );
}
