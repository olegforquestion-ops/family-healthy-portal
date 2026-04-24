import { requireSession } from "@/lib/session";
import { getProfilePageData } from "@/modules/profiles/queries";
import { ProfileForm } from "@/components/forms/profile-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await requireSession();
  const data = await getProfilePageData(session.user.id);
  const currentNorm = data?.nutritionNormSnapshots[0];
  const currentWeight = data?.weightEntries[0];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge>Профиль</Badge>
        <h1 className="font-display text-3xl font-semibold">Профиль и цели на день</h1>
        <p className="max-w-3xl text-muted-foreground">Здесь можно обновить личные данные, текущий вес и выбрать, как задавать дневные нормы: автоматически или вручную.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Данные профиля</CardTitle>
            <CardDescription>Вы управляете только своими личными данными и своими целевыми значениями.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              profile={{
                firstName: data?.profile?.firstName ?? "",
                lastName: data?.profile?.lastName ?? "",
                displayName: data?.profile?.displayName ?? data?.displayName ?? "",
                dateOfBirth: data?.profile?.dateOfBirth ? new Date(data.profile.dateOfBirth).toISOString().slice(0, 10) : "",
                sex: data?.profile?.sex ?? "UNSPECIFIED",
                heightCm: data?.profile?.heightCm?.toString() ?? "",
                targetWeightKg: data?.profile?.targetWeightKg?.toString() ?? "",
                activityLevel: data?.profile?.activityLevel ?? "MODERATE",
                profileGoalTypeCode: data?.profile?.profileGoalTypeCode ?? "MAINTAIN_WEIGHT",
                waterTargetMl: data?.profile?.waterTargetMl?.toString() ?? "",
                notes: data?.profile?.notes ?? "",
                currentWeightKg: currentWeight?.weightKg?.toString() ?? "",
                dailyCalories: currentNorm?.dailyCalories?.toString() ?? "",
                proteinG: currentNorm?.proteinG?.toString() ?? "",
                fatG: currentNorm?.fatG?.toString() ?? "",
                carbsG: currentNorm?.carbsG?.toString() ?? "",
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Текущие нормы</CardTitle>
            <CardDescription>Эти значения используются в дневнике питания, воде и на личной сводке.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Калории", currentNorm ? `${currentNorm.dailyCalories} ккал/день` : "Нет данных"],
              ["Белки", currentNorm ? `${currentNorm.proteinG} г/день` : "Нет данных"],
              ["Жиры", currentNorm ? `${currentNorm.fatG} г/день` : "Нет данных"],
              ["Углеводы", currentNorm ? `${currentNorm.carbsG} г/день` : "Нет данных"],
              ["Вода", currentNorm ? `${currentNorm.waterTargetMl} мл/день` : "Нет данных"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-[1.25rem] bg-muted/60 p-4">
                <span className="font-semibold">{label}</span>
                <span className="text-muted-foreground">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
