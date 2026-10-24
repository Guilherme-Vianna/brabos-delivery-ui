const formatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const MAX_PRICE = 99_999_999.99;

export function formatPrice(value: number): string {
  return formatter.format(value).replace(/ /g, " ");
}

export function priceInputValue(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

export function parsePrice(text: string): number | null {
  const cleaned = text.replace(/R\$|\s/g, "");
  if (!cleaned) return null;
  const normalized = cleaned.includes(",") ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}
