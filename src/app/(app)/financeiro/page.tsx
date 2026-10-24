import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ApiUnavailable } from "@/components/app/api-unavailable";
import { PageHeader } from "@/components/app/page-header";
import { PageLoading } from "@/components/app/page-loading";
import { salesReport } from "@/lib/api/owner";
import type { SalesReport } from "@/lib/api/types";
import { FINANCE_PATH } from "@/lib/auth/constants";
import { requireEstablishment } from "@/lib/auth/current-establishment";
import { formatPrice } from "@/lib/money";
import { PAYMENT_LABELS } from "@/lib/orders";
import { addDays, dateKey, formatShortDate, zonedIso } from "@/lib/time";

export const metadata: Metadata = {
  title: "Financeiro",
};

const PERIODS = [
  { id: "hoje", label: "Hoje", days: 0 },
  { id: "7d", label: "7 dias", days: 6 },
  { id: "30d", label: "30 dias", days: 29 },
  { id: "90d", label: "90 dias", days: 89 },
] as const;

type FinancePageProps = { searchParams: Promise<{ periodo?: string }> };

export default function FinancePage({ searchParams }: FinancePageProps) {
  return (
    <>
      <PageHeader title="Financeiro" description="Vendas sem contar cancelados e pagamentos pendentes." />
      <Suspense fallback={<PageLoading label="Calculando vendas…" />}>
        <FinanceContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function FinanceContent({ searchParams }: FinancePageProps) {
  const establishment = await requireEstablishment();
  if (!establishment) return <ApiUnavailable retryHref={FINANCE_PATH} />;
  const { periodo } = await searchParams;
  const period = PERIODS.find((item) => item.id === periodo) ?? PERIODS[1];
  await connection();
  const today = dateKey(new Date());
  let report: SalesReport;
  try {
    report = await salesReport(zonedIso(addDays(today, -period.days), "00:00"), zonedIso(addDays(today, 1), "00:00"));
  } catch {
    return <ApiUnavailable retryHref={FINANCE_PATH} />;
  }
  const maxDay = Math.max(1, ...report.by_day.map((day) => day.revenue));
  const maxProduct = Math.max(1, ...report.top_products.map((product) => product.quantity));
  const days = Array.from({ length: period.days + 1 }, (_, index) => addDays(today, index - period.days));
  const byDay = new Map(report.by_day.map((day) => [day.day, day]));

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Período" className="flex flex-wrap gap-2">
        {PERIODS.map((item) => (
          <Link
            key={item.id}
            href={`${FINANCE_PATH}?periodo=${item.id}`}
            aria-current={item.id === period.id ? "page" : undefined}
            className={`inline-flex h-11 items-center rounded-full border px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-accent ${
              item.id === period.id ? "border-primary bg-primary text-on-primary" : "border-border-strong text-muted hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Faturamento" value={formatPrice(report.revenue)} highlight />
        <Kpi label="Pedidos" value={String(report.orders)} />
        <Kpi label="Ticket médio" value={formatPrice(report.average_ticket)} />
        <Kpi
          label="Cancelados"
          value={String(report.cancelled_orders)}
          detail={report.cancelled_orders ? formatPrice(report.cancelled_value) : undefined}
        />
      </dl>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section aria-labelledby="by-day" className="rounded-3xl border border-border bg-surface p-5">
          <h2 id="by-day" className="font-display text-2xl tracking-wide">
            Vendas por dia
          </h2>
          {report.orders === 0 ? (
            <p className="mt-3 text-sm text-muted">Nenhuma venda no período.</p>
          ) : (
            <ol className="mt-4 flex h-48 items-end gap-1" aria-label="Faturamento por dia">
              {days.map((day) => {
                const value = byDay.get(day)?.revenue ?? 0;
                return (
                  <li key={day} className="group relative flex h-full flex-1 flex-col justify-end" title={`${formatShortDate(day)}: ${formatPrice(value)}`}>
                    <span className="sr-only">
                      {formatShortDate(day)}: {formatPrice(value)}, {byDay.get(day)?.orders ?? 0} pedidos
                    </span>
                    <span
                      aria-hidden="true"
                      className="w-full rounded-t-md bg-primary/80 group-hover:bg-primary"
                      style={{ height: `${Math.max(value ? 4 : 1, (value / maxDay) * 100)}%` }}
                    />
                  </li>
                );
              })}
            </ol>
          )}
          {report.orders > 0 && days.length > 1 && (
            <div className="mt-2 flex justify-between text-xs text-muted" aria-hidden="true">
              <span>{formatShortDate(days[0])}</span>
              <span>{formatShortDate(days[days.length - 1])}</span>
            </div>
          )}
        </section>

        <section aria-labelledby="payments" className="rounded-3xl border border-border bg-surface p-5">
          <h2 id="payments" className="font-display text-2xl tracking-wide">
            Formas de pagamento
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {report.by_payment_method.map((item) => (
              <li key={item.method} className="flex items-center justify-between gap-3 text-sm">
                <span>{PAYMENT_LABELS[item.method]}</span>
                <span className="text-muted">
                  {item.orders} · <span className="text-ink">{formatPrice(item.revenue)}</span>
                </span>
              </li>
            ))}
            {report.delivery_fees > 0 && (
              <li className="flex items-center justify-between border-t border-border pt-3 text-sm text-muted">
                <span>Taxas de entrega incluídas</span>
                <span>{formatPrice(report.delivery_fees)}</span>
              </li>
            )}
          </ul>
        </section>
      </div>

      <section aria-labelledby="top-products" className="rounded-3xl border border-border bg-surface p-5">
        <h2 id="top-products" className="font-display text-2xl tracking-wide">
          Produtos que mais saem
        </h2>
        <p className="text-sm text-muted">Meio a meio conta meia unidade para cada sabor.</p>
        {report.top_products.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Sem vendas no período.</p>
        ) : (
          <ol className="mt-4 flex flex-col gap-3">
            {report.top_products.map((product, index) => (
              <li key={product.product_id} className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3 text-sm">
                <span className="font-display text-xl text-muted">{index + 1}</span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{product.name}</p>
                  <span aria-hidden="true" className="mt-1 block h-2 rounded-full bg-accent/80" style={{ width: `${(product.quantity / maxProduct) * 100}%` }} />
                </div>
                <span className="text-right">
                  <span className="block font-semibold">{product.quantity.toLocaleString("pt-BR")} un.</span>
                  <span className="text-muted">{formatPrice(product.revenue)}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value, detail, highlight = false }: { label: string; value: string; detail?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-3xl border p-4 ${highlight ? "border-primary/60 bg-primary-soft" : "border-border bg-surface"}`}>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 font-display text-3xl tracking-wide sm:text-4xl">{value}</dd>
      {detail && <dd className="text-sm text-muted">{detail}</dd>}
    </div>
  );
}
