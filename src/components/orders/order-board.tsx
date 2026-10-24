"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/modal";
import type { ActionResult } from "@/lib/actions";
import type { Order, OrderStatus } from "@/lib/api/types";
import { awaitingPayment, boardColumn, type BoardColumn } from "@/lib/orders";
import { acceptOrderAction, cancelOrderAction, deliverOrderAction } from "@/lib/orders/actions";
import { onPushMessage, playChime } from "@/lib/push/client";
import { CancelDialog } from "./cancel-dialog";
import { OrderCard } from "./order-card";
import { OrderDetail } from "./order-detail";

const POLL_MS = 15_000;
const UNDO_MS = 5_000;

const COLUMNS: { id: BoardColumn; title: string; empty: string }[] = [
  { id: "new", title: "Novos", empty: "Nenhum pedido esperando. Os novos aparecem aqui na hora." },
  { id: "active", title: "Em preparo / entrega", empty: "Aceite um pedido para ele vir para cá." },
  { id: "done", title: "Finalizados hoje", empty: "Pedidos entregues e cancelados de hoje." },
];

type Move = { orderId: string; number: number; to: OrderStatus; timer: ReturnType<typeof setTimeout> };

export function OrderBoard({ orders, nowIso }: { orders: Order[]; nowIso: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<BoardColumn>("new");
  const [moves, setMoves] = useState<Move[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<Order | null>(null);
  const [now, setNow] = useState(() => Date.parse(nowIso));
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const known = useRef<Set<string> | null>(null);
  const movesRef = useRef<Move[]>([]);

  useEffect(() => {
    movesRef.current = moves;
  }, [moves]);

  const commit = useCallback(
    async (move: Move) => {
      const action = move.to === "accepted" ? acceptOrderAction : deliverOrderAction;
      const result = await action(move.orderId);
      setMoves((current) => current.filter((item) => item.orderId !== move.orderId));
      if (!result.ok) setError(result.error);
    },
    [],
  );

  useEffect(() => {
    const placed = orders.filter((order) => order.status === "placed" && !awaitingPayment(order)).map((o) => o.id);
    if (known.current) {
      const arrived = placed.filter((id) => !known.current?.has(id));
      if (arrived.length) {
        playChime();
        setFresh((current) => new Set([...current, ...arrived]));
        setTab("new");
      }
    }
    known.current = new Set(orders.map((order) => order.id));
  }, [orders]);

  useEffect(() => {
    const waiting = orders.filter((order) => order.status === "placed").length;
    document.title = waiting ? `(${waiting}) Pedidos · Brabos Delivery` : "Pedidos · Brabos Delivery";
  }, [orders]);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    const poll = setInterval(() => {
      if (document.visibilityState === "visible" && movesRef.current.length === 0) router.refresh();
    }, POLL_MS);
    const offPush = onPushMessage(() => router.refresh());
    const onVisible = () => document.visibilityState === "visible" && router.refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
      offPush();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  useEffect(() => {
    const flush = () => {
      for (const move of movesRef.current) {
        clearTimeout(move.timer);
        void commit(move);
      }
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [commit]);

  const view = useMemo(() => {
    const pending = new Map(moves.map((move) => [move.orderId, move.to]));
    return orders.map((order) => (pending.has(order.id) ? { ...order, status: pending.get(order.id)! } : order));
  }, [orders, moves]);

  const byColumn = useMemo(() => {
    const groups: Record<BoardColumn, Order[]> = { new: [], active: [], done: [] };
    for (const order of view) groups[boardColumn(order)].push(order);
    groups.new.sort((a, b) => a.created_at.localeCompare(b.created_at));
    groups.active.sort((a, b) => (a.accepted_at ?? a.created_at).localeCompare(b.accepted_at ?? b.created_at));
    return groups;
  }, [view]);

  function move(order: Order, to: OrderStatus) {
    setError(null);
    setFresh((current) => {
      const next = new Set(current);
      next.delete(order.id);
      return next;
    });
    const entry: Move = { orderId: order.id, number: order.number, to, timer: setTimeout(() => commit(entry), UNDO_MS) };
    setMoves((current) => [...current.filter((item) => item.orderId !== order.id), entry]);
  }

  function undo(orderId: string) {
    setMoves((current) => {
      const found = current.find((item) => item.orderId === orderId);
      if (found) clearTimeout(found.timer);
      return current.filter((item) => item.orderId !== orderId);
    });
  }

  async function cancel(reason: string): Promise<ActionResult> {
    if (!cancelling) return { ok: true, data: undefined };
    undo(cancelling.id);
    return cancelOrderAction(cancelling.id, reason);
  }

  const detail = view.find((order) => order.id === detailId) ?? null;

  function actions(order: Order) {
    if (order.status === "placed") {
      const waiting = awaitingPayment(order);
      return (
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Button disabled={waiting} onClick={() => move(order, "accepted")}>
            {waiting ? "Aguardando pagamento" : "Aceitar"}
          </Button>
          <Button variant="dangerGhost" onClick={() => setCancelling(order)}>
            Recusar
          </Button>
        </div>
      );
    }
    if (order.status === "accepted") {
      return (
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Button variant="secondary" icon={<CheckIcon />} onClick={() => move(order, "delivered")}>
            Entregue
          </Button>
          <Button variant="dangerGhost" onClick={() => setCancelling(order)}>
            Cancelar
          </Button>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert tone="error">{error}</Alert>}

      <div role="tablist" aria-label="Situação dos pedidos" className="grid grid-cols-3 gap-1 rounded-full bg-surface p-1 lg:hidden">
        {COLUMNS.map((column) => (
          <button
            key={column.id}
            role="tab"
            type="button"
            aria-selected={tab === column.id}
            onClick={() => setTab(column.id)}
            className={`flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full text-sm font-medium focus-visible:outline-2 focus-visible:outline-accent ${
              tab === column.id ? "bg-primary text-on-primary" : "text-muted"
            }`}
          >
            {column.id === "active" ? "Em andamento" : column.title.split(" ")[0]}
            <span
              className={`min-w-6 rounded-full px-1.5 text-xs ${
                tab === column.id ? "bg-black/20" : column.id === "new" && byColumn.new.length ? "bg-primary text-on-primary" : "bg-surface-raised"
              }`}
            >
              {byColumn[column.id].length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((column) => (
          <section
            key={column.id}
            aria-labelledby={`column-${column.id}`}
            className={`flex flex-col gap-3 ${tab === column.id ? "" : "hidden"} lg:flex lg:rounded-3xl lg:bg-surface/40 lg:p-3`}
          >
            <h2 id={`column-${column.id}`} className="hidden items-center justify-between px-1 lg:flex">
              <span className="font-display text-2xl tracking-wide">{column.title}</span>
              <span className="rounded-full bg-surface-raised px-2.5 text-sm text-muted">{byColumn[column.id].length}</span>
            </h2>
            {byColumn[column.id].length === 0 ? (
              <p className="rounded-3xl border border-dashed border-border-strong p-6 text-center text-sm text-muted">{column.empty}</p>
            ) : (
              byColumn[column.id].map((order) => (
                <OrderCard key={order.id} order={order} now={now} fresh={fresh.has(order.id)} onOpen={() => setDetailId(order.id)}>
                  {actions(order)}
                </OrderCard>
              ))
            )}
          </section>
        ))}
      </div>

      {moves.length > 0 && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-20 z-30 mx-auto flex max-w-md flex-col gap-2 md:bottom-6"
        >
          {moves.map((item) => (
            <div key={item.orderId} className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3 text-canvas shadow-2xl">
              <span className="text-sm font-medium">
                Pedido #{item.number} {item.to === "accepted" ? "aceito" : "marcado como entregue"}
              </span>
              <button
                type="button"
                onClick={() => undo(item.orderId)}
                className="h-10 cursor-pointer rounded-full px-3 text-sm font-bold text-primary uppercase focus-visible:outline-2 focus-visible:outline-primary"
              >
                Desfazer
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={detail !== null} onClose={() => setDetailId(null)} title={detail ? `Pedido #${detail.number}` : ""} wide>
        {detail && (
          <>
            <OrderDetail order={detail} />
            <div
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("button")) setDetailId(null);
              }}
            >
              {actions(detail)}
            </div>
          </>
        )}
      </Modal>

      <CancelDialog orderNumber={cancelling?.number ?? null} onClose={() => setCancelling(null)} onConfirm={cancel} />
    </div>
  );
}
