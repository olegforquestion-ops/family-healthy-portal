import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdminSession } from "@/lib/session";
import { listUsersWithSummaries } from "@/modules/users/repository";

export default async function AdminUsersPage() {
  await requireAdminSession();
  const users = await listUsersWithSummaries();

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link href="/admin/users/new">
          <Button>Создать пользователя</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список учетных записей</CardTitle>
          <CardDescription>Текущая реализация ограничена core-полями и кратким сводным состоянием.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-3 py-3">Имя</th>
                <th className="px-3 py-3">Логин</th>
                <th className="px-3 py-3">Роль</th>
                <th className="px-3 py-3">Статус</th>
                <th className="px-3 py-3">Цель профиля</th>
                <th className="px-3 py-3">Последний вес</th>
                <th className="px-3 py-3">Норма калорий</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const currentNorm = user.nutritionNormSnapshots[0];
                const latestWeight = user.weightEntries[0];

                return (
                  <tr key={user.id} className="border-b border-border/70">
                    <td className="px-3 py-4 font-semibold">{user.displayName}</td>
                    <td className="px-3 py-4 text-muted-foreground">{user.login}</td>
                    <td className="px-3 py-4">{user.role.label}</td>
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {user.status === "ACTIVE" ? "Активен" : "Неактивен"}
                      </span>
                    </td>
                    <td className="px-3 py-4">{user.profile?.profileGoalType.label ?? "Не заполнено"}</td>
                    <td className="px-3 py-4">{latestWeight ? `${latestWeight.weightKg} кг` : "Нет данных"}</td>
                    <td className="px-3 py-4">{currentNorm ? `${currentNorm.dailyCalories} ккал` : "Нет расчета"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
