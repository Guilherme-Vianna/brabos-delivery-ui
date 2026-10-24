import type { Doneness, Product } from "@/lib/api/types";

export type CartLine = {
  key: string;
  productId: string;
  halfProductId: string | null;
  name: string;
  halfName: string | null;
  unitPrice: number;
  quantity: number;
  doneness: Doneness | null;
  notes: string;
};

export const MAX_QUANTITY = 99;

export const DONENESS_LABELS: Record<Doneness, string> = {
  rare: "Mal passada",
  medium_rare: "Ao ponto p/ mal",
  medium: "Ao ponto",
  medium_well: "Ao ponto p/ bem",
  well_done: "Bem passada",
};

export function unitPrice(product: Pick<Product, "price">, half?: Pick<Product, "price"> | null): number {
  return half ? Math.max(product.price, half.price) : product.price;
}

export function needsDoneness(product: Pick<Product, "asks_doneness">, half?: Pick<Product, "asks_doneness"> | null) {
  return product.asks_doneness || Boolean(half?.asks_doneness);
}

export function lineLabel(line: Pick<CartLine, "name" | "halfName">): string {
  return line.halfName ? `½ ${line.name} + ½ ${line.halfName}` : line.name;
}

export function buildLine(
  product: Product,
  half: Product | null,
  quantity: number,
  doneness: Doneness | null,
  notes: string,
): CartLine {
  const trimmed = notes.trim();
  const ids = [product.id, half?.id].filter(Boolean).sort().join("+");
  return {
    key: `${ids}|${doneness ?? ""}|${trimmed}`,
    productId: product.id,
    halfProductId: half?.id ?? null,
    name: product.name,
    halfName: half?.name ?? null,
    unitPrice: unitPrice(product, half),
    quantity: Math.min(Math.max(quantity, 1), MAX_QUANTITY),
    doneness: needsDoneness(product, half) ? doneness : null,
    notes: trimmed,
  };
}

export function addLine(lines: CartLine[], line: CartLine): CartLine[] {
  const existing = lines.find((item) => item.key === line.key);
  if (!existing) return [...lines, line];
  return lines.map((item) =>
    item.key === line.key ? { ...item, quantity: Math.min(item.quantity + line.quantity, MAX_QUANTITY) } : item,
  );
}

export function setQuantity(lines: CartLine[], key: string, quantity: number): CartLine[] {
  if (quantity <= 0) return lines.filter((item) => item.key !== key);
  return lines.map((item) => (item.key === key ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) } : item));
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function cartTotals(lines: CartLine[], fee: { enabled: boolean; value: number }) {
  const subtotal = round(lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0));
  const deliveryFee = fee.enabled ? fee.value : 0;
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  return { subtotal, deliveryFee, total: round(subtotal + deliveryFee), count };
}

export function syncWithMenu(lines: CartLine[], products: Product[]): CartLine[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  return lines.flatMap((line) => {
    const product = byId.get(line.productId);
    const half = line.halfProductId ? byId.get(line.halfProductId) : null;
    if (!product || (line.halfProductId && !half)) return [];
    return [{ ...line, name: product.name, halfName: half?.name ?? null, unitPrice: unitPrice(product, half) }];
  });
}

export function toOrderItems(lines: CartLine[]) {
  return lines.map((line) => ({
    product_id: line.productId,
    half_product_id: line.halfProductId,
    quantity: line.quantity,
    doneness: line.doneness,
    notes: line.notes || null,
  }));
}
