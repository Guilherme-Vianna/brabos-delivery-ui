import "server-only";
import { apiFetch, customerFetch, fetchAll, publicFetch, type Page } from "./client";
import type {
  CourierMembership,
  Customer,
  CustomerOrder,
  OpeningDay,
  Order,
  PlacedOrder,
  Product,
  PublicEstablishment,
} from "./types";

const id = encodeURIComponent;

export function getStore(slug: string) {
  return publicFetch<PublicEstablishment>(`/establishments/${id(slug)}`);
}

export function listStoreProducts(slug: string) {
  return fetchAll<Product>(`/establishments/${id(slug)}/products`, publicFetch);
}

export function getStoreHours(slug: string) {
  return publicFetch<{ days: OpeningDay[] }>(`/establishments/${id(slug)}/opening-hours`);
}

export type OrderInput = {
  full_name: string;
  phone: string;
  address: string;
  reference_point: string | null;
  notes: string | null;
  payment_method: string;
  change_for: number | null;
  items: {
    product_id: string;
    half_product_id: string | null;
    quantity: number;
    doneness: string | null;
    notes: string | null;
  }[];
};

export function placeOrder(slug: string, device: string, payload: OrderInput) {
  return customerFetch<PlacedOrder>(`/establishments/${id(slug)}/orders`, device, { method: "POST", json: payload });
}

export function getMyOrder(slug: string, device: string, orderId: string) {
  return customerFetch<Order>(`/establishments/${id(slug)}/my-orders/${id(orderId)}`, device);
}

export function listMyStoreOrders(slug: string, device: string) {
  return customerFetch<Page<Order>>(`/establishments/${id(slug)}/my-orders?limit=5`, device);
}

export function cancelMyOrder(slug: string, device: string, orderId: string, reason: string | null) {
  return customerFetch<Order>(`/establishments/${id(slug)}/my-orders/${id(orderId)}/cancel`, device, {
    method: "POST",
    json: { reason },
  });
}

export function registerCustomerPush(device: string, fcmToken: string) {
  return customerFetch<void>("/push-devices", device, {
    method: "POST",
    json: { fcm_token: fcmToken, role: "customer" },
  });
}

export function getCustomerProfile() {
  return apiFetch<Customer>("/customers/me");
}

export function saveCustomerProfile(payload: Omit<Customer, "id">) {
  return apiFetch<Customer>("/customers/me", { method: "PUT", json: payload });
}

export function listCustomerOrders() {
  return apiFetch<Page<CustomerOrder>>("/customers/me/orders?limit=30");
}

export function describeInvite(token: string) {
  return publicFetch<{ establishment_name: string; expires_at: string }>(`/courier-invites/${id(token)}`);
}

export function acceptInvite(token: string, payload: { name: string; phone: string | null }) {
  return apiFetch<CourierMembership>(`/courier-invites/${id(token)}/accept`, { method: "POST", json: payload });
}

export function listMyMemberships() {
  return apiFetch<CourierMembership[]>("/courier/me");
}

export function listCourierOrders() {
  return apiFetch<Page<Order>>("/courier/orders?limit=100");
}

export function deliverAsCourier(orderId: string) {
  return apiFetch<Order>(`/courier/orders/${id(orderId)}/deliver`, { method: "POST" });
}
