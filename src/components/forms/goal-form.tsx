"use client";

import { useActionState, useEffect, useState } from "react";

import { createGoalAction } from "@/modules/goals/actions";
import { Button } from "@/components/ui/button";

const initialState = {};

type GoalTemplateOption = {
  code: string;
  label: string;
  description: string;
  unitLabel: string;
};

type GoalFormProps = {
  templates: GoalTemplateOption[];
};

function getTodayValue() {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

export function GoalForm({ templates }: GoalFormProps) {
  const [state, formAction, pending] = useActionState(createGoalAction, initialState);
  const [templateCode, setTemplateCode] = useState(templates[0]?.code ?? "");
  const [targetPlaceholder, setTargetPlaceholder] = useState("Например, 5");
  const selectedTemplate = templates.find((template) => template.code === templateCode);

  useEffect(() => {
    switch (templateCode) {
      case "TARGET_WEIGHT":
        setTargetPlaceholder("Например, 68");
        break;
      case "WORKOUT_COUNT":
        setTargetPlaceholder("Например, 12");
        break;
      case "DISTANCE_KM":
        setTargetPlaceholder("Например, 100");
        break;
      default:
        setTargetPlaceholder("Например, 7");
        break;
    }
  }, [templateCode]);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-semibold" htmlFor="goal-template">
          Шаблон цели
        </label>
        <select
          id="goal-template"
          name="goalTemplateCode"
          value={templateCode}
          onChange={(event) => setTemplateCode(event.target.value)}
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
        >
          {templates.map((template) => (
            <option key={template.code} value={template.code}>
              {template.label}
            </option>
          ))}
        </select>
        {selectedTemplate ? <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p> : null}
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-semibold" htmlFor="goal-title">
          Название
        </label>
        <input
          id="goal-title"
          name="title"
          placeholder="Можно оставить пустым, тогда название соберется автоматически"
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="goal-target">
          Целевое значение {selectedTemplate ? `(${selectedTemplate.unitLabel})` : ""}
        </label>
        <input
          id="goal-target"
          name="targetValue"
          type="number"
          min="0.1"
          step="0.1"
          placeholder={targetPlaceholder}
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="goal-start-date">
          Дата начала
        </label>
        <input
          id="goal-start-date"
          name="startDate"
          type="date"
          defaultValue={getTodayValue()}
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="goal-due-date">
          Срок выполнения
        </label>
        <input
          id="goal-due-date"
          name="dueDate"
          type="date"
          defaultValue={getDefaultDueDate()}
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold" htmlFor="goal-note">
          Комментарий
        </label>
        <input
          id="goal-note"
          name="note"
          placeholder="Необязательно"
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
        />
      </div>

      {state?.error ? <p className="text-sm text-danger md:col-span-2">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-success md:col-span-2">{state.success}</p> : null}

      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Сохраняем..." : "Создать цель"}
        </Button>
      </div>
    </form>
  );
}
