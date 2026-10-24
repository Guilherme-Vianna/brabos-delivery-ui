import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ApiUnavailable } from "@/components/app/api-unavailable";
import { PageHeader } from "@/components/app/page-header";
import { PageLoading } from "@/components/app/page-loading";
import { listAudit, listOrderEvents } from "@/lib/api/owner";
import { HISTORY_PATH } from "@/lib/auth/constants";
import { loadCurrentEstablishment, requireEstablishment } from "@/lib/auth/current-establishment";
import { ACTOR_LABELS, EVENT_LABELS } from "@/lib/orders";
import { dateKey, formatShortDate, formatTime } from "@/lib/time";

export const metadata: Metadata = {
  title: "Histórico",
};

const PAGE_SIZE = 50;

const ENTITIES: Record<string, string> = {
  establishments: "Loja",
  products: "Produto",
  orders: "Pedido",
  order_items: "Item de pedido",
  order_events: "Evento de pedido",
  opening_hours: "Horário",
  absences: "Pausa",
  couriers: "Entregador",
  courier_invites: "Convite",
  push_devices: "Notificação",
};

const OPERATIONS = { insert: "criou", update: "alterou", delete: "removeu" } as const;

type HistoryPageProps = { searchParams: Promise<{ aba?: string; pagina?: string; tipo?: string }> };

export default function HistoryPage({ searchParams }: HistoryPageProps) {
  return (
    <>
      <PageHeader title="Histórico" description="Tudo o que aconteceu: pedidos e cada alteração feita na loja." />
      <Suspense fallback={<PageLoading label="Carregando histórico…" />}>
        <HistoryContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

function pageHref(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== "") search.set(key, String(value));
  return `${HISTORY_PATH}?${search.toString()}`;
}

function stamp(iso: string, today: string) {
  const day = dateKey(iso);
  return `${day === today ? "Hoje" : formatShortDate(day)}, ${formatTime(iso)}`;
}

async function HistoryContent({ searchParams }: HistoryPageProps) {
  const establishment = await requireEstablishment();
  if (!establishment) return <ApiUnavailable retryHref={HISTORY_PATH} />;
  const { user } = await loadCurrentEstablishment();
  const { aba, pagina, tipo } = await searchParams;
  const tab = aba === "auditoria" ? "auditoria" : "pedidos";
  const page = Math.max(1, Number(pagina) || 1);
  const entity = tipo && tipo in ENTITIES ? tipo : undefined;
  await connection();
  const today = dateKey(new Date());
  const offset = (page - 1) * PAGE_SIZE;

  const [events, audit] = await Promise.all([
    tab === "pedidos" ? listOrderEvents({ offset, limit: PAGE_SIZE }).catch(() => null) : null,
    tab === "auditoria" ? listAudit({ offset, limit: PAGE_SIZE, entity }).catch(() => null) : null,
  ]);
  if (!events && !audit) return <ApiUnavailable retryHref={HISTORY_PATH} />;
  const total = events?.total ?? audit?.total ?? 0;
  let content;
  if (events) {
    content = (
      <ol className="flex flex-col divide-y divide-border rounded-3xl border border-border bg-surface">
        {events.items.map((event) => (
          <li key={event.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
            <p>
              <span className="font-semibold">#{event.order_number}</span> {EVENT_LABELS[event.kind]}
              <span className="text-muted"> · {ACTOR_LABELS[event.actor]}</span>
              {event.detail && event.detail !== "auto_accept" && <span className="block text-sm text-muted">{event.detail}</span>}
            </p>
            <time dateTime={event.created_at} className="text-sm text-muted">
              {stamp(event.created_at, today)}
            </time>
          </li>
        ))}
      </ol>
    );
  } else if (audit) {
    content = (
      <>
        <div className="flex flex-wrap gap-2">
          {[undefined, ...Object.keys(ENTITIES)].map((key) => (
            <Link
              key={key ?? "all"}
              href={pageHref({ aba: "auditoria", tipo: key })}
              aria-current={entity === key ? "page" : undefined}
              className={`inline-flex h-10 items-center rounded-full border px-3 text-sm ${
                entity === key ? "border-accent bg-accent text-canvas" : "border-border-strong text-muted hover:text-ink"
              }`}
            >
              {key ? ENTITIES[key] : "Tudo"}
            </Link>
          ))}
        </div>
        <ol className="flex flex-col divide-y divide-border rounded-3xl border border-border bg-surface">
          {audit.items.map((entry) => {
            const name = entry.snapshot.name ?? entry.snapshot.number ?? entry.snapshot.product_name;
            return (
              <li key={entry.history_id} className="flex flex-col gap-1 px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p>
                    <span className="text-muted">{entry.changed_by ? (entry.changed_by === user.uid ? "Você" : "Entregador/cliente") : "Cliente/sistema"}</span>{" "}
                    {OPERATIONS[entry.operation]} {ENTITIES[entry.entity]?.toLowerCase() ?? entry.entity}
                    {name !== undefined && <span className="font-semibold"> {String(name)}</span>}
                  </p>
                  <time dateTime={entry.valid_from} className="text-sm text-muted">
                    {stamp(entry.valid_from, today)}
                  </time>
                </div>
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted">Ver dados</summary>
                  <pre className="mt-2 overflow-x-auto rounded-2xl bg-canvas p-3 text-xs">{JSON.stringify(entry.snapshot, null, 2)}</pre>
                </details>
              </li>
            );
          })}
        </ol>
      </>
    );
  }
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" className="grid max-w-md grid-cols-2 gap-1 rounded-full bg-surface p-1">
        {[
          { id: "pedidos", label: "Pedidos" },
          { id: "auditoria", label: "Alterações" },
        ].map((item) => (
          <Link
            key={item.id}
            role="tab"
            aria-selected={tab === item.id}
            href={pageHref({ aba: item.id })}
            className={`flex h-11 items-center justify-center rounded-full text-sm font-medium ${
              tab === item.id ? "bg-primary text-on-primary" : "text-muted"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      {total === 0 ? <p className="text-muted">Nada por aqui ainda.</p> : content}
      {pages > 1 && (
        <nav aria-label="Páginas" className="flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={pageHref({ aba: tab, tipo: entity, pagina: page - 1 })} className="text-accent underline underline-offset-4">
              ← Mais recentes
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted">
            Página {page} de {pages}
          </span>
          {page < pages ? (
            <Link href={pageHref({ aba: tab, tipo: entity, pagina: page + 1 })} className="text-accent underline underline-offset-4">
              Mais antigos →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
