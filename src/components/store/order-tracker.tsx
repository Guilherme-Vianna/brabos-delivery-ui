"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { EnablePushButton } from "@/components/push/enable-push-button";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckIcon, PhoneIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/modal";
import { TextField } from "@/components/ui/text-field";
import type { Order, PublicEstablishment } from "@/lib/api/types";
import { STORE_PATH } from "@/lib/auth/constants";
import { DONENESS_LABELS, lineLabel, type CartLine } from "@/lib/cart";
import { cancelMyOrderAction, getMyOrderAction } from "@/lib/customer/actions";
import { deviceToken } from "@/lib/customer/device";
import { writeStored } from "@/lib/customer/stored";
import { formatPrice } from "@/lib/money";
import { awaitingPayment, CUSTOMER_STEPS, formatPhone, PAYMENT_LABELS, phoneHref } from "@/lib/orders";
import { onPushMessage } from "@/lib/push/client";
import { registerCustomerPushAction } from "@/lib/push/actions";
import { formatTime } from "@/lib/time";

const POLL_MS = 20_000;

type OrderTrackerProps = { store: PublicEstablishment; orderId: string; justPlaced: boolean; payment: string | null };

export function OrderTracker({ store, orderId, justPlaced, payment }: OrderTrackerProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "offline">("loading");
  const [cancelOpen, setCancelOpen] = useState(false);

  const load = useCallback(async () => {
    const result = await getMyOrderAction(store.slug, deviceToken(), orderId);
    if (result.ok) {
      setOrder(result.data);
      setState("ready");
    } else setState((current) => (result.error === "not-found" ? "missing" : current === "ready" ? "ready" : "offline"));
  }, [store.slug, orderId]);

  useEffect(() => {
    let active = true;
    const run = () => active && document.visibilityState === "visible" && load();
    const first = setTimeout(() => void load(), 0);
    const timer = setInterval(run, POLL_MS);
    const offPush = onPushMessage(() => run());
    return () => {
      active = false;
      clearTimeout(first);
      clearInterval(timer);
      offPush();
    };
  }, [load]);

  if (state === "loading") return <p role="status" className="text-muted">Buscando seu pedido…</p>;
  if (state === "missing" || !order) {
    return (
      <Alert tone={state === "offline" ? "error" : "info"}>
        {state === "offline"
          ? "Sem conexão com a loja agora. Tentaremos de novo automaticamente."
          : "Não encontramos este pedido neste aparelho. Ele aparece só no celular em que foi feito (ou na sua conta, se entrou)."}
      </Alert>
    );
  }

  const stepIndex = order.status === "cancelled" ? -1 : CUSTOMER_STEPS.findIndex((step) => step.status === order.status);
  const waitingPayment = awaitingPayment(order);

  function reorder() {
    if (!order) return;
    const lines: CartLine[] = order.items.map((item) => ({
      key: `${[item.product_id, item.half_product_id].filter(Boolean).sort().join("+")}|${item.doneness ?? ""}|${item.notes ?? ""}`,
      productId: item.product_id,
      halfProductId: item.half_product_id,
      name: item.product_name,
      halfName: item.half_product_name,
      unitPrice: item.unit_price,
      quantity: item.quantity,
      doneness: item.doneness,
      notes: item.notes ?? "",
    }));
    writeStored(`brabos:cart:${store.slug}`, JSON.stringify(lines));
  }

  return (
    <div className="flex flex-col gap-6">
      {justPlaced && order.status === "placed" && !waitingPayment && (
        <Alert tone="success">Pedido enviado! A loja já foi avisada.</Alert>
      )}
      {payment === "cancelado" && waitingPayment && (
        <Alert tone="error">O pagamento não foi concluído. O pedido será cancelado automaticamente se não for pago.</Alert>
      )}

      <div>
        <p className="text-sm text-muted">Pedido #{order.number} · feito às {formatTime(order.created_at)}</p>
        <h1 className="mt-1 font-display text-5xl tracking-wide">
          {order.status === "cancelled"
            ? "Pedido cancelado"
            : waitingPayment
              ? "Aguardando pagamento"
              : order.status === "placed"
                ? "Aguardando a loja"
                : order.status === "accepted"
                  ? "Preparando e entregando"
                  : "Entregue. Bom apetite!"}
        </h1>
        {order.status === "cancelled" && order.cancel_reason && <p className="mt-2 text-muted">Motivo: {order.cancel_reason}</p>}
      </div>

      {order.status !== "cancelled" && (
        <ol className="grid grid-cols-3 gap-2" aria-label="Andamento do pedido">
          {CUSTOMER_STEPS.map((step, index) => {
            const done = index <= stepIndex;
            return (
              <li key={step.status} aria-current={index === stepIndex ? "step" : undefined} className="flex flex-col gap-2">
                <span className={`h-2 rounded-full ${done ? "bg-primary" : "bg-surface-raised"}`} />
                <span className={`flex items-center gap-1 text-sm ${done ? "text-ink" : "text-muted"}`}>
                  {done && <CheckIcon className="size-4 text-primary" />}
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {(order.status === "placed" || order.status === "accepted") && (
        <div className="rounded-3xl border border-border bg-surface p-4">
          <p className="mb-3 text-sm text-muted">Quer saber quando mudar? Receba um aviso no celular.</p>
          <EnablePushButton register={(token) => registerCustomerPushAction(deviceToken(), token)} label="Me avise por aqui" />
        </div>
      )}

      <section className="rounded-3xl border border-border bg-surface p-4">
        <ul className="flex flex-col gap-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 text-sm">
              <span>
                <span className="font-semibold">{item.quantity}×</span> {lineLabel({ name: item.product_name, halfName: item.half_product_name })}
                {(item.doneness || item.notes) && (
                  <span className="block text-muted">{[item.doneness && DONENESS_LABELS[item.doneness], item.notes].filter(Boolean).join(" · ")}</span>
                )}
              </span>
              <span className="text-muted">{formatPrice(item.line_total)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 grid grid-cols-2 gap-y-1 border-t border-border pt-3 text-sm">
          <dt className="text-muted">Entrega</dt>
          <dd className="text-right">{order.delivery_fee ? formatPrice(order.delivery_fee) : "Grátis"}</dd>
          <dt className="font-semibold">Total</dt>
          <dd className="text-right font-semibold text-accent">{formatPrice(order.total)}</dd>
          <dt className="text-muted">Pagamento</dt>
          <dd className="text-right">{PAYMENT_LABELS[order.payment_method]}</dd>
        </dl>
        <p className="mt-3 text-sm text-muted">Entregar em: {order.address}</p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={phoneHref(store.phone)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border-strong px-6 font-medium hover:border-ink"
        >
          <PhoneIcon /> Ligar para a loja {formatPhone(store.phone)}
        </a>
        {order.status === "placed" && (
          <Button variant="dangerGhost" block={false} onClick={() => setCancelOpen(true)}>
            Cancelar pedido
          </Button>
        )}
        {(order.status === "delivered" || order.status === "cancelled") && (
          <Link
            href={`${STORE_PATH}/${store.slug}`}
            onClick={reorder}
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 font-semibold text-on-primary hover:bg-primary-hover"
          >
            Pedir de novo
          </Link>
        )}
      </div>

      <CancelOrder
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onCancel={async (reason) => {
          const result = await cancelMyOrderAction(store.slug, deviceToken(), order.id, reason);
          if (result.ok) setOrder(result.data);
          return result;
        }}
      />
    </div>
  );
}

function CancelOrder({
  open,
  onClose,
  onCancel,
}: {
  open: boolean;
  onClose: () => void;
  onCancel: (reason: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <Modal open={open} onClose={onClose} locked={pending} title="Cancelar o pedido?" description="Só dá para cancelar enquanto a loja não aceitou.">
      {error && <Alert tone="error">{error}</Alert>}
      <TextField label="Motivo" optional value={reason} maxLength={200} onChange={(event) => setReason(event.target.value)} />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" disabled={pending} onClick={onClose}>
          Manter pedido
        </Button>
        <Button
          variant="danger"
          className="sm:w-auto"
          loading={pending}
          loadingLabel="Cancelando…"
          onClick={() =>
            startTransition(async () => {
              const result = await onCancel(reason);
              if (result.ok) onClose();
              else setError(result.error);
            })
          }
        >
          Cancelar pedido
        </Button>
      </div>
    </Modal>
  );
}
