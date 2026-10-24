"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckIcon, MapPinIcon, PhoneIcon } from "@/components/ui/icons";
import type { CourierMembership, Order } from "@/lib/api/types";
import { lineLabel } from "@/lib/cart";
import { courierDeliverAction } from "@/lib/courier/actions";
import { formatPrice } from "@/lib/money";
import { changeDue, formatPhone, mapsUrl, PAYMENT_LABELS, phoneHref } from "@/lib/orders";
import { onPushMessage, playChime } from "@/lib/push/client";
import { formatTime } from "@/lib/time";

const linkClass =
  "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-border-strong px-4 text-sm font-medium hover:border-ink";

export function DeliveryList({ orders, memberships }: { orders: Order[]; memberships: CourierMembership[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const names = new Map(memberships.map((item) => [item.establishment_id, item.establishment_name]));

  useEffect(() => {
    const poll = setInterval(() => document.visibilityState === "visible" && router.refresh(), 20_000);
    const off = onPushMessage(() => {
      playChime();
      router.refresh();
    });
    return () => {
      clearInterval(poll);
      off();
    };
  }, [router]);

  function deliver(orderId: string) {
    setError(null);
    setPendingId(orderId);
    startTransition(async () => {
      const result = await courierDeliverAction(orderId);
      if (!result.ok) setError(result.error);
      setPendingId(null);
      setConfirming(null);
    });
  }

  if (orders.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border-strong p-8 text-center text-muted">
        Nenhuma entrega no momento. Quando a loja aceitar um pedido, ele aparece aqui.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert tone="error">{error}</Alert>}
      <ul className="grid gap-4 md:grid-cols-2">
        {orders.map((order) => {
          const change = changeDue(order);
          return (
            <li key={order.id} className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-3xl tracking-wide">#{order.number}</p>
                <p className="text-sm text-muted">
                  {memberships.length > 1 && `${names.get(order.establishment_id)} · `}aceito {formatTime(order.accepted_at ?? order.created_at)}
                </p>
              </div>
              <div>
                <p className="font-semibold">{order.full_name}</p>
                <p className="text-muted">{order.address}</p>
                {order.reference_point && <p className="text-sm text-muted">Referência: {order.reference_point}</p>}
              </div>
              <p className="text-sm text-muted">
                {order.items.map((item) => `${item.quantity}× ${lineLabel({ name: item.product_name, halfName: item.half_product_name })}`).join(", ")}
              </p>
              <p className="rounded-2xl bg-accent-soft px-4 py-2 text-sm text-accent">
                {order.payment_method === "online" ? "Já pago online" : `Cobrar ${formatPrice(order.total)} · ${PAYMENT_LABELS[order.payment_method]}`}
                {change !== null && change > 0 && ` · levar troco de ${formatPrice(change)}`}
              </p>
              <div className="flex gap-2">
                <a className={linkClass} href={mapsUrl(order.address)} target="_blank" rel="noreferrer">
                  <MapPinIcon /> Rota
                </a>
                <a className={linkClass} href={phoneHref(order.phone)} aria-label={`Ligar para ${formatPhone(order.phone)}`}>
                  <PhoneIcon /> Ligar
                </a>
              </div>
              {confirming === order.id ? (
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <Button variant="ghost" block={false} disabled={pendingId === order.id} onClick={() => setConfirming(null)}>
                    Voltar
                  </Button>
                  <Button icon={<CheckIcon />} loading={pendingId === order.id} loadingLabel="Confirmando…" onClick={() => deliver(order.id)}>
                    Confirmar entrega
                  </Button>
                </div>
              ) : (
                <Button icon={<CheckIcon />} onClick={() => setConfirming(order.id)}>
                  Entreguei
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
