"use server";

import { refresh } from "next/cache";
import { apiStatus, handleCommonErrors, requireSession, type ActionResult } from "@/lib/actions";
import { orderAction } from "@/lib/api/owner";

const MESSAGES: Record<number, string> = {
  404: "Este pedido não existe mais. A lista foi atualizada.",
  409: "O pedido mudou enquanto isso (aceito, entregue ou cancelado). A lista foi atualizada.",
};

async function run(orderId: string, action: "accept" | "deliver" | "cancel", reason?: string): Promise<ActionResult> {
  await requireSession();
  try {
    await orderAction(orderId, action, reason);
  } catch (error) {
    handleCommonErrors(error);
    refresh();
    return { ok: false, error: MESSAGES[apiStatus(error)] ?? "Não foi possível atualizar o pedido. Tente de novo." };
  }
  refresh();
  return { ok: true, data: undefined };
}

export async function acceptOrderAction(orderId: string) {
  return run(orderId, "accept");
}

export async function deliverOrderAction(orderId: string) {
  return run(orderId, "deliver");
}

export async function cancelOrderAction(orderId: string, reason: string): Promise<ActionResult> {
  if (reason.trim().length < 3) return { ok: false, error: "Escolha ou escreva o motivo do cancelamento." };
  return run(orderId, "cancel", reason.trim());
}
