"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TextField } from "@/components/ui/text-field";
import type { Establishment } from "@/lib/api/types";
import type { EstablishmentInput } from "@/lib/api/owner";
import { updateSettingsAction } from "@/lib/establishment/actions";
import { parsePrice, priceInputValue } from "@/lib/money";

type Flags = Pick<Establishment, "auto_accept" | "delivery_fee_enabled" | "online_payments_enabled">;

export function DeliverySettings({ establishment }: { establishment: Establishment }) {
  const [flags, setFlags] = useOptimistic<Flags>({
    auto_accept: establishment.auto_accept,
    delivery_fee_enabled: establishment.delivery_fee_enabled,
    online_payments_enabled: establishment.online_payments_enabled,
  });
  const [fee, setFee] = useState(priceInputValue(establishment.delivery_fee));
  const [minOrder, setMinOrder] = useState(establishment.min_order ? priceInputValue(establishment.min_order) : "");
  const [errors, setErrors] = useState<{ fee?: string; minOrder?: string }>({});
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function apply(changes: EstablishmentInput, optimistic?: Partial<Flags>, success?: string) {
    setMessage(null);
    startTransition(async () => {
      if (optimistic) setFlags((current) => ({ ...current, ...optimistic }));
      const result = await updateSettingsAction(changes);
      setMessage(result.ok ? (success ? { tone: "success", text: success } : null) : { tone: "error", text: result.error });
    });
  }

  function saveValues() {
    const feeValue = parsePrice(fee || "0");
    const minValue = minOrder.trim() ? parsePrice(minOrder) : null;
    const found = {
      fee: feeValue === null ? "Digite a taxa, ex.: 5,00." : undefined,
      minOrder: minOrder.trim() && minValue === null ? "Digite o valor, ex.: 20,00 — ou deixe vazio." : undefined,
    };
    setErrors(found);
    if (found.fee || found.minOrder) return;
    apply({ delivery_fee: feeValue ?? 0, min_order: minValue }, undefined, "Valores salvos.");
  }

  return (
    <div className="flex flex-col gap-4">
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <Switch
        checked={flags.auto_accept}
        onChange={(checked) => apply({ auto_accept: checked }, { auto_accept: checked })}
        label="Aceitar pedidos automaticamente"
        description="Os pedidos já entram em preparo e os entregadores são avisados."
      />
      <Switch
        checked={flags.delivery_fee_enabled}
        onChange={(checked) => apply({ delivery_fee_enabled: checked }, { delivery_fee_enabled: checked })}
        label="Cobrar taxa de entrega"
        description={flags.delivery_fee_enabled ? "A taxa abaixo é somada ao pedido." : "Entrega grátis para todos."}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Taxa de entrega"
          inputMode="decimal"
          disabled={!flags.delivery_fee_enabled || pending}
          value={fee}
          error={errors.fee}
          onChange={(event) => setFee(event.target.value)}
        />
        <TextField
          label="Pedido mínimo"
          optional
          inputMode="decimal"
          placeholder="Sem mínimo"
          disabled={pending}
          value={minOrder}
          error={errors.minOrder}
          onChange={(event) => setMinOrder(event.target.value)}
        />
      </div>
      <Button variant="secondary" className="sm:w-auto sm:self-start" block={false} loading={pending} loadingLabel="Salvando…" onClick={saveValues}>
        Salvar valores
      </Button>
      <Switch
        checked={flags.online_payments_enabled}
        onChange={(checked) => apply({ online_payments_enabled: checked }, { online_payments_enabled: checked })}
        label="Pagamento online (cartão via Stripe)"
        description="O cliente paga ao pedir; cancelamentos são estornados automaticamente."
      />
    </div>
  );
}
