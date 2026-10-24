import "server-only";
import { apiFetch, fetchAll, queryString, type Page } from "./client";
import type {
  Absence,
  AuditEntry,
  Courier,
  CourierInvite,
  Establishment,
  OpeningDay,
  Order,
  OrderEvent,
  OrderStatus,
  Product,
  SalesReport,
  Upload,
} from "./types";

const id = encodeURIComponent;

export type EstablishmentInput = Partial<
  Pick<
    Establishment,
    | "name"
    | "address"
    | "phone"
    | "cnpj"
    | "slug"
    | "primary_color"
    | "accent_color"
    | "auto_accept"
    | "delivery_fee_enabled"
    | "delivery_fee"
    | "min_order"
    | "online_payments_enabled"
    | "logo_key"
  >
>;

export function getMyEstablishment() {
  return apiFetch<Establishment>("/establishments/me");
}

export function registerEstablishment(payload: EstablishmentInput) {
  return apiFetch<Establishment>("/establishments", { method: "POST", json: payload });
}

export function updateEstablishment(payload: EstablishmentInput) {
  return apiFetch<Establishment>("/establishments/me", { method: "PATCH", json: payload });
}

export function deleteEstablishment() {
  return apiFetch<void>("/establishments/me", { method: "DELETE" });
}

export function getOpeningHours() {
  return apiFetch<{ days: OpeningDay[] }>("/opening-hours");
}

export function replaceOpeningHours(days: OpeningDay[]) {
  return apiFetch<{ days: OpeningDay[] }>("/opening-hours", { method: "PUT", json: { days } });
}

export function listAbsences() {
  return fetchAll<Absence>("/absences");
}

export function createAbsence(payload: { starts_at: string; ends_at: string; reason: string | null }) {
  return apiFetch<Absence>("/absences", { method: "POST", json: payload });
}

export function deleteAbsence(absenceId: string) {
  return apiFetch<void>(`/absences/${id(absenceId)}`, { method: "DELETE" });
}

export type ProductInput = Partial<
  Pick<
    Product,
    | "name"
    | "price"
    | "description"
    | "ingredients"
    | "category"
    | "allows_half"
    | "asks_doneness"
    | "active"
    | "position"
    | "image_key"
  >
>;

export function listMyProducts() {
  return fetchAll<Product>("/products");
}

export function createProduct(payload: ProductInput) {
  return apiFetch<Product>("/products", { method: "POST", json: payload });
}

export function updateProduct(productId: string, payload: ProductInput) {
  return apiFetch<Product>(`/products/${id(productId)}`, { method: "PATCH", json: payload });
}

export function deleteProduct(productId: string) {
  return apiFetch<void>(`/products/${id(productId)}`, { method: "DELETE" });
}

export function listOrders(statuses: OrderStatus[], from?: string, to?: string, limit = 100) {
  const search = new URLSearchParams({ limit: String(limit) });
  for (const status of statuses) search.append("status", status);
  if (from) search.set("from", from);
  if (to) search.set("to", to);
  return apiFetch<Page<Order>>(`/orders?${search.toString()}`);
}

export function orderAction(orderId: string, action: "accept" | "deliver" | "cancel", reason?: string) {
  return apiFetch<Order>(`/orders/${id(orderId)}/${action}`, {
    method: "POST",
    json: action === "cancel" ? { reason } : undefined,
  });
}

export function listOrderEvents(params: { offset?: number; limit?: number; order_id?: string }) {
  return apiFetch<Page<OrderEvent>>(`/order-events${queryString(params)}`);
}

export function listAudit(params: { offset?: number; limit?: number; entity?: string }) {
  return apiFetch<Page<AuditEntry>>(`/audit${queryString(params)}`);
}

export function salesReport(from: string, to: string) {
  return apiFetch<SalesReport>(`/reports/sales${queryString({ from, to })}`);
}

export function listCouriers() {
  return fetchAll<Courier>("/couriers");
}

export function createCourierInvite() {
  return apiFetch<CourierInvite>("/courier-invites", { method: "POST" });
}

export function setCourierActive(courierId: string, active: boolean) {
  return apiFetch<Courier>(`/couriers/${id(courierId)}`, { method: "PATCH", json: { active } });
}

export function requestUpload(kind: "product" | "logo", contentType: string, size: number) {
  return apiFetch<Upload>("/uploads", { method: "POST", json: { kind, content_type: contentType, size } });
}

export function registerPushDevice(fcmToken: string, role: "owner" | "courier") {
  return apiFetch<void>("/push-devices", { method: "POST", json: { fcm_token: fcmToken, role } });
}
