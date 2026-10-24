import type { Order, OrderActor, OrderEvent, OrderStatus, PaymentMethod } from "@/lib/api/types";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Novo",
  accepted: "Em preparo / entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const CUSTOMER_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "placed", label: "Recebido" },
  { status: "accepted", label: "Aceito" },
  { status: "delivered", label: "Entregue" },
];

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: "Pix na entrega",
  card: "Cartão na entrega",
  cash: "Dinheiro",
  online: "Pago online",
};

export const ACTOR_LABELS: Record<OrderActor, string> = {
  owner: "Loja",
  customer: "Cliente",
  courier: "Entregador",
  system: "Automático",
};

export const EVENT_LABELS: Record<OrderEvent["kind"], string> = {
  placed: "Pedido feito",
  accepted: "Pedido aceito",
  delivered: "Pedido entregue",
  cancelled: "Pedido cancelado",
  paid: "Pagamento confirmado",
  refunded: "Pagamento estornado",
};

export const CANCEL_REASONS = [
  "Acabou um ingrediente",
  "Fora da área de entrega",
  "Cliente pediu para cancelar",
  "Loja fechando",
  "Pedido duplicado",
];

export type BoardColumn = "new" | "active" | "done";

export function boardColumn(order: Pick<Order, "status">): BoardColumn {
  if (order.status === "placed") return "new";
  if (order.status === "accepted") return "active";
  return "done";
}

export function awaitingPayment(order: Pick<Order, "payment_method" | "payment_status">): boolean {
  return order.payment_method === "online" && order.payment_status === "pending";
}

export function changeDue(order: Pick<Order, "payment_method" | "change_for" | "total">): number | null {
  if (order.payment_method !== "cash" || order.change_for === null) return null;
  return Math.round((order.change_for - order.total) * 100) / 100;
}

export function minutesSince(iso: string, now: number): number {
  return Math.max(0, Math.floor((now - Date.parse(iso)) / 60000));
}

export function elapsedLabel(minutes: number): string {
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `há ${hours}h${String(minutes % 60).padStart(2, "0")}`;
}

export function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function phoneHref(phone: string): string {
  return `tel:+55${phone.replace(/\D/g, "")}`;
}

export function whatsappHref(phone: string, text: string): string {
  return `https://wa.me/55${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return phone;
}
