"use server";

import { apiDetail, apiStatus, type ActionResult } from "@/lib/actions";
import { cancelMyOrder, getMyOrder, listMyStoreOrders, placeOrder, type OrderInput } from "@/lib/api/public";
import type { Order } from "@/lib/api/types";
import { isDeviceToken } from "./device";

const OFFLINE = "Não conseguimos falar com a loja agora. Seu carrinho continua salvo; tente de novo em instantes.";

function placeError(error: unknown): string {
  const status = apiStatus(error);
  const detail = apiDetail(error);
  if (status === 409) return "A loja acabou de fechar ou pausou os pedidos. Seu carrinho fica salvo para depois.";
  if (status === 404) return "Esta loja não existe mais.";
  if (status === 503) return "O pagamento online está indisponível agora. Escolha pagar na entrega.";
  if (status === 422) {
    if (detail.startsWith("Products are not available")) return "Um item do carrinho saiu do cardápio. Atualize a página e confira.";
    if (detail.includes("minimum")) return "O pedido não atingiu o valor mínimo da loja.";
    if (detail.includes("doneness")) return "Escolha o ponto da carne dos lanches que pedem.";
    if (detail.includes("change_for")) return "O troco precisa ser para um valor maior que o total.";
    if (detail.includes("Online payments")) return "Pagamento online indisponível. Escolha outra forma.";
    return "Confira os dados do pedido e tente de novo.";
  }
  return OFFLINE;
}

export async function placeOrderAction(
  slug: string,
  device: string,
  payload: OrderInput,
): Promise<ActionResult<{ id: string; checkoutUrl: string | null }>> {
  if (!isDeviceToken(device)) return { ok: false, error: OFFLINE };
  try {
    const order = await placeOrder(slug, device, payload);
    return { ok: true, data: { id: order.id, checkoutUrl: order.checkout_url } };
  } catch (error) {
    return { ok: false, error: placeError(error) };
  }
}

export async function getMyOrderAction(slug: string, device: string, orderId: string): Promise<ActionResult<Order>> {
  if (!isDeviceToken(device)) return { ok: false, error: "not-found" };
  try {
    return { ok: true, data: await getMyOrder(slug, device, orderId) };
  } catch (error) {
    return { ok: false, error: apiStatus(error) === 404 ? "not-found" : OFFLINE };
  }
}

export async function listMyStoreOrdersAction(slug: string, device: string): Promise<Order[]> {
  if (!isDeviceToken(device)) return [];
  try {
    return (await listMyStoreOrders(slug, device)).items;
  } catch {
    return [];
  }
}

export async function cancelMyOrderAction(
  slug: string,
  device: string,
  orderId: string,
  reason: string,
): Promise<ActionResult<Order>> {
  if (!isDeviceToken(device)) return { ok: false, error: OFFLINE };
  try {
    return { ok: true, data: await cancelMyOrder(slug, device, orderId, reason.trim() || null) };
  } catch (error) {
    if (apiStatus(error) === 409) return { ok: false, error: "A loja já aceitou seu pedido. Para cancelar, fale com ela pelo telefone." };
    return { ok: false, error: OFFLINE };
  }
}
