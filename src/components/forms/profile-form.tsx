"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { saveProfileAction, type ProfileActionState } from "@/modules/profiles/actions";

const initialState: ProfileActionState = {};

type ProfileFormProps = {
  profile: {
    firstName: string;
    lastName: string | null;
    displayName: string;
    dateOfBirth: string;
    sex: string;
    heightCm: string;
    targetWeightKg: string;
    activityLevel: string;
    profileGoalTypeCode: string;
    waterTargetMl: string;
    notes: string;
    currentWeightKg: string;
    dailyCalories: string;
    proteinG: string;
    fatG: string;
    carbsG: string;
    initialNormMode: "AUTO" | "MANUAL";
  };
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(saveProfileAction, initialState);
  const [normMode, setNormMode] = useState<"AUTO" | "MANUAL">(profile.initialNormMode);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="firstName">
          Имя
        </label>
        <input id="firstName" name="firstName" defaultValue={profile.firstName} required className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="lastName">
          Фамилия
        </label>
        <input id="lastName" name="lastName" defaultValue={profile.lastName ?? ""} className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="displayName">
          Отображаемое имя
        </label>
        <input id="displayName" name="displayName" defaultValue={profile.displayName} required className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="dateOfBirth">
          Дата рождения
        </label>
        <input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={profile.dateOfBirth} className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="sex">
          Пол
        </label>
        <select id="sex" name="sex" defaultValue={profile.sex} className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm">
          <option value="UNSPECIFIED">Не указан</option>
          <option value="FEMALE">Женский</option>
          <option value="MALE">Мужской</option>
          <option value="OTHER">Другой</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="heightCm">
          Рост, см
        </label>
        <input id="heightCm" name="heightCm" type="number" step="0.1" defaultValue={profile.heightCm} required className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="currentWeightKg">
          Текущий вес, кг
        </label>
        <input id="currentWeightKg" name="currentWeightKg" type="number" step="0.1" defaultValue={profile.currentWeightKg} required className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="targetWeightKg">
          Целевой вес, кг
        </label>
        <input id="targetWeightKg" name="targetWeightKg" type="number" step="0.1" defaultValue={profile.targetWeightKg} className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="activityLevel">
          Уровень активности
        </label>
        <select id="activityLevel" name="activityLevel" defaultValue={profile.activityLevel} className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm">
          <option value="LOW">Низкий</option>
          <option value="LIGHT">Легкий</option>
          <option value="MODERATE">Средний</option>
          <option value="HIGH">Высокий</option>
          <option value="VERY_HIGH">Очень высокий</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="profileGoalTypeCode">
          Цель профиля
        </label>
        <select id="profileGoalTypeCode" name="profileGoalTypeCode" defaultValue={profile.profileGoalTypeCode} className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm">
          <option value="LOSE_WEIGHT">Снижение веса</option>
          <option value="SLOW_WEIGHT_LOSS">Плавное снижение веса</option>
          <option value="MAINTAIN_WEIGHT">Поддержание веса</option>
          <option value="GAIN_WEIGHT">Набор массы</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="waterTargetMl">
          Норма воды, мл
        </label>
        <input id="waterTargetMl" name="waterTargetMl" type="number" defaultValue={profile.waterTargetMl} className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      <div className="space-y-3 rounded-[1.5rem] border border-border bg-muted/40 p-4 sm:col-span-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Как задать нормы питания</p>
          <p className="text-sm text-muted-foreground">Ручная норма теперь сохраняется как отдельный режим и не пересчитывается автоматически при изменении веса.</p>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm">
            <input type="radio" name="normMode" value="AUTO" checked={normMode === "AUTO"} onChange={() => setNormMode("AUTO")} className="mt-1" />
            <span className="space-y-1">
              <span className="block font-semibold">Рассчитать автоматически</span>
              <span className="block text-muted-foreground">Калории и БЖУ будут определены по росту, весу, активности и цели.</span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm">
            <input type="radio" name="normMode" value="MANUAL" checked={normMode === "MANUAL"} onChange={() => setNormMode("MANUAL")} className="mt-1" />
            <span className="space-y-1">
              <span className="block font-semibold">Задать вручную</span>
              <span className="block text-muted-foreground">Используйте свои целевые значения калорий, белков, жиров и углеводов.</span>
            </span>
          </label>
        </div>
      </div>

      {normMode === "MANUAL" ? (
        <>
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="manualDailyCalories">
              Калории, ккал
            </label>
            <input id="manualDailyCalories" name="manualDailyCalories" type="number" step="1" min="1" defaultValue={profile.dailyCalories} className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="manualProteinG">
              Белки, г
            </label>
            <input id="manualProteinG" name="manualProteinG" type="number" step="0.1" min="0.1" defaultValue={profile.proteinG} className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="manualFatG">
              Жиры, г
            </label>
            <input id="manualFatG" name="manualFatG" type="number" step="0.1" min="0.1" defaultValue={profile.fatG} className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="manualCarbsG">
              Углеводы, г
            </label>
            <input id="manualCarbsG" name="manualCarbsG" type="number" step="0.1" min="0.1" defaultValue={profile.carbsG} className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
          </div>
        </>
      ) : null}

      <div className="space-y-2 sm:col-span-2">
        <label className="text-sm font-semibold" htmlFor="notes">
          Комментарий
        </label>
        <textarea id="notes" name="notes" defaultValue={profile.notes} rows={4} className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm" />
      </div>

      {state?.error ? <p className="text-sm text-danger sm:col-span-2">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-success sm:col-span-2">{state.success}</p> : null}

      <div className="sm:col-span-2">
        <Button className="w-full sm:w-auto" type="submit" disabled={pending}>
          {pending ? "Сохраняем..." : normMode === "MANUAL" ? "Сохранить профиль и ручные нормы" : "Сохранить профиль и пересчитать нормы"}
        </Button>
      </div>
    </form>
  );
}
