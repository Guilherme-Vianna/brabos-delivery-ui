"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Alert } from "./alert";
import { Button } from "./button";
import { Modal } from "./modal";

type ConfirmDialogProps = {
  trigger: (open: () => void) => ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  cancelLabel?: string;
  onConfirm: () => Promise<{ ok: true } | { ok: false; error: string }>;
};

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  pendingLabel,
  cancelLabel = "Voltar",
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function show() {
    setError(null);
    setOpen(true);
  }

  function confirm() {
    startTransition(async () => {
      const result = await onConfirm();
      if (result.ok) setOpen(false);
      else setError(result.error);
    });
  }

  return (
    <>
      {trigger(show)}
      <Modal open={open} onClose={() => setOpen(false)} title={title} description={description} locked={pending}>
        {error && <Alert tone="error">{error}</Alert>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" autoFocus disabled={pending} onClick={() => setOpen(false)}>
            {cancelLabel}
          </Button>
          <Button variant="danger" className="sm:w-auto" loading={pending} loadingLabel={pendingLabel} onClick={confirm}>
            {confirmLabel}
          </Button>
        </div>
      </Modal>
    </>
  );
}
