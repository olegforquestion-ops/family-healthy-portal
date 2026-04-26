import { DeleteFoodButton } from "@/components/foods/delete-food-button";
import { FoodItemForm } from "@/components/forms/food-item-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/session";
import { deleteFoodAction } from "@/modules/foods/actions";
import { listFoodItems } from "@/modules/foods/queries";

export default async function FoodsPage() {
  await requireSession();
  const foods = await listFoodItems();

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card>
          <CardHeader>
            <CardTitle>Добавить запись</CardTitle>
            <CardDescription>
              Для блюда можно сразу задать порцию в граммах по умолчанию, чтобы она автоматически подставлялась в дневник питания.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FoodItemForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Каталог</CardTitle>
            <CardDescription>Все активные продукты и блюда, доступные для выбора в дневнике питания.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-3 py-3">Название</th>
                  <th className="px-3 py-3">Тип</th>
                  <th className="px-3 py-3">Порция по умолчанию</th>
                  <th className="px-3 py-3">Ккал</th>
                  <th className="px-3 py-3">Б</th>
                  <th className="px-3 py-3">Ж</th>
                  <th className="px-3 py-3">У</th>
                  <th className="px-3 py-3">Автор</th>
                  <th className="px-3 py-3">Действие</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((food) => (
                  <tr key={food.id} className="border-b border-border/70 align-top">
                    <td className="px-3 py-4 font-semibold">{food.name}</td>
                    <td className="px-3 py-4">
                      <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                        {food.type === "DISH" ? "Блюдо" : "Продукт"}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {food.defaultPortionGrams ? `${food.defaultPortionGrams.toString()} г` : "—"}
                    </td>
                    <td className="px-3 py-4">{food.caloriesPer100g.toString()}</td>
                    <td className="px-3 py-4">{food.proteinPer100g.toString()}</td>
                    <td className="px-3 py-4">{food.fatPer100g.toString()}</td>
                    <td className="px-3 py-4">{food.carbsPer100g.toString()}</td>
                    <td className="px-3 py-4 text-muted-foreground">{food.createdBy?.displayName ?? "Справочник"}</td>
                    <td className="px-3 py-4">
                      <form action={deleteFoodAction}>
                        <input type="hidden" name="foodId" value={food.id} />
                        <DeleteFoodButton foodName={food.name} />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
