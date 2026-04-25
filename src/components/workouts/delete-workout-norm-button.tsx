"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full sm:w-auto" size="sm" type="submit" variant="outline" disabled={pending}>
      {pending ? "Удаляем..." : "Удалить норматив"}
    </Button>
  );
}

type DeleteWorkoutNormButtonProps = {
  normName: string;
};

export function DeleteWorkoutNormButton({ normName }: DeleteWorkoutNormButtonProps) {
  return (
    <div
      onClick={(event) => {
        const confirmed = window.confirm(`Удалить норматив "${normName}"? Он исчезнет из списка выбора, но старые тренировки останутся в истории.`);

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
