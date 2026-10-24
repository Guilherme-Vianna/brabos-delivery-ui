"use client";

import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Modal } from "@/components/ui/modal";
import { TextField } from "@/components/ui/text-field";
import type { ActionResult } from "@/lib/actions";
import { CANCEL_REASONS } from "@/lib/orders";

type CancelDialogProps = {
  orderNumber: number | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<ActionResult>;
};

export function CancelDialog({ orderNumber, onClose, onConfirm }: CancelDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    setReason("");
    setError(null);
    onClose();
  }

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await onConfirm(reason);
      if (result.ok) close();
      else setError(result.error);
    });
  }

  return (
    <Modal
      open={orderNumber !== null}
      onClose={close}
      locked={pending}
      title={`Cancelar pedido #${orderNumber ?? ""}`}
      description="O cliente é avisado. Se foi pago online, o valor é estornado."
    >
      {error && <Alert tone="error">{error}</Alert>}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Motivos comuns">
        {CANCEL_REASONS.map((item) => (
          <Chip key={item} selected={reason === item} onClick={() => setReason(item)} disabled={pending}>
            {item}
          </Chip>
        ))}
      </div>
      <TextField
        label="Motivo"
        placeholder="Ou escreva aqui"
        value={reason}
        maxLength={200}
        disabled={pending}
        onChange={(event) => setReason(event.target.value)}
      />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" disabled={pending} onClick={close}>
          Voltar
        </Button>
        <Button
          variant="danger"
          className="sm:w-auto"
          loading={pending}
          loadingLabel="Cancelando…"
          disabled={reason.trim().length < 3}
          onClick={confirm}
        >
          Cancelar pedido
        </Button>
      </div>
    </Modal>
  );
}
