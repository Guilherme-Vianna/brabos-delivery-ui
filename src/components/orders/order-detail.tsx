import { MapPinIcon, PhoneIcon } from "@/components/ui/icons";
import type { Order } from "@/lib/api/types";
import { DONENESS_LABELS, lineLabel } from "@/lib/cart";
import { formatPrice } from "@/lib/money";
import {
  ACTOR_LABELS,
  changeDue,
  formatPhone,
  mapsUrl,
  PAYMENT_LABELS,
  phoneHref,
  whatsappHref,
} from "@/lib/orders";
import { formatTime } from "@/lib/time";

const linkClass =
  "inline-flex h-11 items-center gap-2 rounded-full border border-border-strong px-4 text-sm font-medium text-ink hover:border-ink focus-visible:outline-2 focus-visible:outline-accent";

export function OrderDetail({ order }: { order: Order }) {
  const change = changeDue(order);
  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2">
        <p className="font-semibold text-ink">{order.full_name}</p>
        <p className="text-sm text-muted">
          {order.address}
          {order.reference_point && <span className="block">Referência: {order.reference_point}</span>}
        </p>
        <div className="flex flex-wrap gap-2">
          <a className={linkClass} href={mapsUrl(order.address)} target="_blank" rel="noreferrer">
            <MapPinIcon /> Mapa
          </a>
          <a className={linkClass} href={phoneHref(order.phone)}>
            <PhoneIcon /> {formatPhone(order.phone)}
          </a>
          <a
            className={linkClass}
            href={whatsappHref(order.phone, `Olá, ${order.full_name.split(" ")[0]}! Sobre seu pedido #${order.number}: `)}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </section>

      <section>
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-ink">
                  <span className="font-semibold">{item.quantity}×</span>{" "}
                  {lineLabel({ name: item.product_name, halfName: item.half_product_name })}
                </p>
                {(item.doneness || item.notes) && (
                  <p className="text-sm text-muted">
                    {[item.doneness && DONENESS_LABELS[item.doneness], item.notes].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-sm text-muted">{formatPrice(item.line_total)}</span>
            </li>
          ))}
        </ul>
        {order.notes && <p className="mt-3 rounded-2xl bg-accent-soft px-4 py-3 text-sm text-accent">Obs.: {order.notes}</p>}
      </section>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <dt className="text-muted">Subtotal</dt>
        <dd className="text-right">{formatPrice(order.subtotal)}</dd>
        <dt className="text-muted">Entrega</dt>
        <dd className="text-right">{order.delivery_fee ? formatPrice(order.delivery_fee) : "Grátis"}</dd>
        <dt className="font-semibold text-ink">Total</dt>
        <dd className="text-right font-semibold text-accent">{formatPrice(order.total)}</dd>
        <dt className="text-muted">Pagamento</dt>
        <dd className="text-right">{PAYMENT_LABELS[order.payment_method]}</dd>
        {change !== null && (
          <>
            <dt className="text-muted">Troco para {formatPrice(order.change_for ?? 0)}</dt>
            <dd className="text-right font-semibold text-accent">{formatPrice(change)}</dd>
          </>
        )}
      </dl>

      <ol className="flex flex-col gap-1 border-t border-border pt-4 text-sm text-muted">
        <li>Recebido às {formatTime(order.created_at)}</li>
        {order.accepted_at && <li>Aceito às {formatTime(order.accepted_at)}</li>}
        {order.delivered_at && <li>Entregue às {formatTime(order.delivered_at)}</li>}
        {order.cancelled_at && (
          <li className="text-danger">
            Cancelado às {formatTime(order.cancelled_at)}
            {order.cancelled_by && ` por ${ACTOR_LABELS[order.cancelled_by].toLowerCase()}`}
            {order.cancel_reason && ` — ${order.cancel_reason}`}
          </li>
        )}
      </ol>
    </div>
  );
}
