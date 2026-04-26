"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type DeleteEntryButtonProps = {
  confirmText: string;
  idleLabel?: string;
  pendingLabel?: string;
  className?: string;
};

function SubmitButton({
  idleLabel,
  pendingLabel,
  className,
}: {
  idleLabel: string;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      className={className ?? "w-full sm:w-auto"}
      size="sm"
      type="submit"
      variant="outline"
      disabled={pending}
    >
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}

export function DeleteEntryButton({
  confirmText,
  idleLabel = "Удалить",
  pendingLabel = "Удаляем...",
  className,
}: DeleteEntryButtonProps) {
  return (
    <div
      onClick={(event) => {
        const confirmed = window.confirm(confirmText);

        if (!confirmed) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <SubmitButton idleLabel={idleLabel} pendingLabel={pendingLabel} className={className} />
    </div>
  );
}
