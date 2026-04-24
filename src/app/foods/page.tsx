import { requireSession } from "@/lib/session";
import { listFoodItems } from "@/modules/foods/queries";
import { FoodItemForm } from "@/components/forms/food-item-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function FoodsPage() {
  await requireSession();
  const foods = await listFoodItems();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge>База продуктов</Badge>
        <h1 className="font-display text-3xl font-semibold">Общая база продуктов и блюд</h1>
        <p className="max-w-3xl text-muted-foreground">
          Здесь собраны продукты и блюда, которые можно быстро выбирать при заполнении дневника питания.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card>
          <CardHeader>
            <CardTitle>Добавить запись</CardTitle>
            <CardDescription>Только самое нужное: название, тип и значения на 100 г.</CardDescription>
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
                  <th className="px-3 py-3">Порция</th>
                  <th className="px-3 py-3">Ккал</th>
                  <th className="px-3 py-3">Б</th>
                  <th className="px-3 py-3">Ж</th>
                  <th className="px-3 py-3">У</th>
                  <th className="px-3 py-3">Автор</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((food) => (
                  <tr key={food.id} className="border-b border-border/70">
                    <td className="px-3 py-4 font-semibold">{food.name}</td>
                    <td className="px-3 py-4">
                      <Badge variant={food.type === "DISH" ? "warning" : "secondary"}>
                        {food.type === "DISH" ? "Блюдо" : "Продукт"}
                      </Badge>
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">{food.portionLabel ?? "100 г"}</td>
                    <td className="px-3 py-4">{food.caloriesPer100g.toString()}</td>
                    <td className="px-3 py-4">{food.proteinPer100g.toString()}</td>
                    <td className="px-3 py-4">{food.fatPer100g.toString()}</td>
                    <td className="px-3 py-4">{food.carbsPer100g.toString()}</td>
                    <td className="px-3 py-4 text-muted-foreground">{food.createdBy?.displayName ?? "Справочник"}</td>
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
