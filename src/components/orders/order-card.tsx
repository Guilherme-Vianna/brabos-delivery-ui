import type { ReactNode } from "react";
import type { Order } from "@/lib/api/types";
import { DONENESS_LABELS, lineLabel } from "@/lib/cart";
import { formatPrice } from "@/lib/money";
import { awaitingPayment, changeDue, elapsedLabel, minutesSince, PAYMENT_LABELS } from "@/lib/orders";
import { formatTime } from "@/lib/time";

type OrderCardProps = {
  order: Order;
  now: number;
  fresh?: boolean;
  onOpen: () => void;
  children?: ReactNode;
};

export function OrderCard({ order, now, fresh = false, onOpen, children }: OrderCardProps) {
  const minutes = minutesSince(order.created_at, now);
  const late = order.status === "placed" && minutes >= 10;
  const change = changeDue(order);
  const waitingPayment = awaitingPayment(order);

  return (
    <article
      className={`flex flex-col gap-3 rounded-3xl border bg-surface p-4 ${
        fresh ? "animate-pulse-ring border-primary" : late ? "border-accent/60" : "border-border"
      } ${order.status === "cancelled" ? "opacity-70" : ""}`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex cursor-pointer flex-col gap-2 rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        aria-label={`Ver detalhes do pedido ${order.number} de ${order.full_name}`}
      >
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-3xl tracking-wide text-ink">#{order.number}</p>
          <p className={`text-sm ${late ? "font-semibold text-accent" : "text-muted"}`}>
            {formatTime(order.created_at)} · {elapsedLabel(minutes)}
          </p>
        </div>
        <p className="truncate font-semibold text-ink">{order.full_name}</p>
        <ul className="flex flex-col gap-0.5 text-sm text-muted">
          {order.items.slice(0, 4).map((item) => (
            <li key={item.id} className="truncate">
              <span className="font-semibold text-ink">{item.quantity}×</span> {lineLabel({ name: item.product_name, halfName: item.half_product_name })}
              {item.doneness && <span> · {DONENESS_LABELS[item.doneness]}</span>}
            </li>
          ))}
          {order.items.length > 4 && <li>+ {order.items.length - 4} itens</li>}
        </ul>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-accent">{formatPrice(order.total)}</span>
          <span className="rounded-full bg-surface-raised px-2.5 py-0.5 text-muted">{PAYMENT_LABELS[order.payment_method]}</span>
          {change !== null && change > 0 && (
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-accent">Troco {formatPrice(change)}</span>
          )}
          {waitingPayment && (
            <span className="rounded-full bg-slate px-2.5 py-0.5 text-ink">Aguardando pagamento</span>
          )}
          {order.status === "cancelled" && (
            <span className="rounded-full bg-danger-soft px-2.5 py-0.5 text-danger">Cancelado</span>
          )}
          {order.status === "delivered" && (
            <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-success">Entregue</span>
          )}
        </div>
      </button>
      {children}
    </article>
  );
}
