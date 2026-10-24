import type { PaymentMethod } from "@/lib/api/types";
import { validatePhone } from "@/lib/establishment/validation";
import { parsePrice } from "@/lib/money";

export type CheckoutValues = {
  fullName: string;
  phone: string;
  address: string;
  referencePoint: string;
  notes: string;
  payment: PaymentMethod;
  changeFor: string;
};

export type CheckoutErrors = Partial<Record<keyof CheckoutValues, string>>;

export const PROFILE_KEY = "brabos:customer";
export const EMPTY_CHECKOUT: CheckoutValues = {
  fullName: "",
  phone: "",
  address: "",
  referencePoint: "",
  notes: "",
  payment: "pix",
  changeFor: "",
};

export function validateCheckout(values: CheckoutValues, total: number): CheckoutErrors {
  const errors: CheckoutErrors = {};
  if (values.fullName.trim().length < 2) errors.fullName = "Digite seu nome para o entregador chamar.";
  const phone = validatePhone(values.phone);
  if (phone) errors.phone = phone;
  if (values.address.trim().length < 5) errors.address = "Digite rua, número e bairro.";
  if (values.payment === "cash" && values.changeFor.trim()) {
    const change = parsePrice(values.changeFor);
    if (change === null) errors.changeFor = "Digite um valor, ex.: 100.";
    else if (change < total) errors.changeFor = "O troco precisa ser para um valor maior que o total.";
  }
  return errors;
}

export function rememberedProfile(raw: string | null): Partial<CheckoutValues> {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const pick = (key: keyof CheckoutValues) => (typeof data[key] === "string" ? (data[key] as string) : undefined);
    return Object.fromEntries(
      (["fullName", "phone", "address", "referencePoint"] as const).flatMap((key) => {
        const value = pick(key);
        return value === undefined ? [] : [[key, value]];
      }),
    );
  } catch {
    return {};
  }
}

export function profileToRemember(values: CheckoutValues): string {
  const { fullName, phone, address, referencePoint } = values;
  return JSON.stringify({ fullName, phone, address, referencePoint });
}
