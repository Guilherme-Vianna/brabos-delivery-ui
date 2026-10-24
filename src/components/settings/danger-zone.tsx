"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteEstablishmentAction } from "@/lib/establishment/actions";

export function DangerZone({ name }: { name: string }) {
  return (
    <ConfirmDialog
      trigger={(open) => (
        <Button variant="dangerGhost" block={false} onClick={open}>
          Excluir loja
        </Button>
      )}
      title={`Excluir ${name}?`}
      description="Apaga cardápio, pedidos, horários e entregadores. Não dá para desfazer."
      confirmLabel="Excluir para sempre"
      pendingLabel="Excluindo…"
      onConfirm={async () => {
        const result = await deleteEstablishmentAction();
        return result.ok ? { ok: true } : result;
      }}
    />
  );
}
