"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full sm:w-auto" size="sm" type="submit" variant="outline" disabled={pending}>
      {pending ? "Удаляем..." : "Удалить"}
    </Button>
  );
}

type DeleteFoodButtonProps = {
  foodName: string;
};

export function DeleteFoodButton({ foodName }: DeleteFoodButtonProps) {
  return (
    <div
      onClick={(event) => {
        const confirmed = window.confirm(`Удалить "${foodName}" из базы? Запись исчезнет из каталога и выбора в питании.`);

        if (!confirmed) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <SubmitButton />
    </div>
  );
}
