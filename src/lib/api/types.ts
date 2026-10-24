export type Establishment = {
  id: string;
  slug: string;
  name: string;
  address: string;
  phone: string;
  cnpj: string | null;
  primary_color: string;
  accent_color: string;
  auto_accept: boolean;
  delivery_fee_enabled: boolean;
  delivery_fee: number;
  min_order: number | null;
  online_payments_enabled: boolean;
  logo_key: string | null;
  logo_url: string | null;
};

export type PublicEstablishment = Omit<Establishment, "cnpj" | "auto_accept" | "logo_key"> & {
  is_open: boolean;
  absence_reason: string | null;
  absence_ends_at: string | null;
};

export type OpeningDay = { weekday: number; opens_at: string; closes_at: string };

export type Absence = { id: string; starts_at: string; ends_at: string; reason: string | null };

export type Product = {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  category: string;
  price: number;
  allows_half: boolean;
  asks_doneness: boolean;
  position: number;
  image_url: string | null;
  active?: boolean;
  image_key?: string | null;
};

export type OrderStatus = "placed" | "accepted" | "delivered" | "cancelled";
export type PaymentMethod = "cash" | "pix" | "card" | "online";
export type PaymentStatus = "not_required" | "pending" | "paid" | "refunded";
export type OrderActor = "owner" | "customer" | "courier" | "system";
export type Doneness = "rare" | "medium_rare" | "medium" | "medium_well" | "well_done";

export type OrderItem = {
  id: string;
  product_id: string;
  half_product_id: string | null;
  product_name: string;
  half_product_name: string | null;
  unit_price: number;
  quantity: number;
  doneness: Doneness | null;
  notes: string | null;
  line_total: number;
};

export type Order = {
  id: string;
  establishment_id: string;
  number: number;
  status: OrderStatus;
  full_name: string;
  phone: string;
  address: string;
  reference_point: string | null;
  notes: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  change_for: number | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  courier_id: string | null;
  cancel_reason: string | null;
  cancelled_by: OrderActor | null;
  accepted_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  items: OrderItem[];
};

export type PlacedOrder = Order & { checkout_url: string | null };
export type CustomerOrder = Order & { establishment_slug: string; establishment_name: string };

export type OrderEvent = {
  id: string;
  order_id: string;
  order_number: number;
  kind: "placed" | "accepted" | "delivered" | "cancelled" | "paid" | "refunded";
  actor: OrderActor;
  actor_uid: string | null;
  detail: string | null;
  created_at: string;
};

export type AuditEntry = {
  history_id: string;
  entity: string;
  entity_id: string;
  operation: "insert" | "update" | "delete";
  valid_from: string;
  changed_by: string | null;
  snapshot: Record<string, unknown>;
};

export type Courier = { id: string; name: string; phone: string | null; active: boolean };
export type CourierInvite = { token: string; url: string; expires_at: string };
export type CourierMembership = {
  courier_id: string;
  establishment_id: string;
  establishment_name: string;
  establishment_slug: string;
};

export type Customer = {
  id: string;
  full_name: string;
  phone: string;
  address: string | null;
  reference_point: string | null;
};

export type SalesReport = {
  starts_from: string;
  starts_until: string;
  orders: number;
  revenue: number;
  average_ticket: number;
  delivery_fees: number;
  cancelled_orders: number;
  cancelled_value: number;
  by_payment_method: { method: PaymentMethod; orders: number; revenue: number }[];
  by_day: { day: string; orders: number; revenue: number }[];
  top_products: { product_id: string; name: string; quantity: number; revenue: number }[];
};

export type Upload = {
  key: string;
  upload_url: string;
  method: string;
  headers: Record<string, string>;
  expires_at: string;
  public_url: string;
};
