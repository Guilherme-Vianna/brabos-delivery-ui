"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { MinusIcon, PlusIcon } from "@/components/ui/icons";
import { TextField } from "@/components/ui/text-field";
import type { PaymentMethod, PublicEstablishment } from "@/lib/api/types";
import { cartTotals, DONENESS_LABELS, lineLabel, toOrderItems, type CartLine } from "@/lib/cart";
import { placeOrderAction } from "@/lib/customer/actions";
import {
  EMPTY_CHECKOUT,
  PROFILE_KEY,
  profileToRemember,
  rememberedProfile,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutValues,
} from "@/lib/customer/checkout";
import { deviceToken } from "@/lib/customer/device";
import { useStoredString, writeStored } from "@/lib/customer/stored";
import { digits, maskPhone } from "@/lib/establishment/validation";
import { formatPrice, parsePrice } from "@/lib/money";
import { PAYMENT_LABELS } from "@/lib/orders";
import { STORE_PATH } from "@/lib/auth/constants";

type CheckoutPanelProps = {
  store: PublicEstablishment;
  lines: CartLine[];
  profile: Partial<CheckoutValues> | null;
  onQuantity: (key: string, quantity: number) => void;
  onPlaced: () => void;
};

export function CheckoutPanel({ store, lines, profile, onQuantity, onPlaced }: CheckoutPanelProps) {
  const router = useRouter();
  const [remembered] = useStoredString(PROFILE_KEY);
  const [edits, setEdits] = useState<Partial<CheckoutValues>>({});
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const changeForRef = useRef<HTMLInputElement>(null);

  const values: CheckoutValues = useMemo(
    () => ({ ...EMPTY_CHECKOUT, ...rememberedProfile(remembered), ...(profile ?? {}), ...edits }),
    [remembered, profile, edits],
  );
  const totals = cartTotals(lines, { enabled: store.delivery_fee_enabled, value: store.delivery_fee });
  const belowMinimum = store.min_order !== null && totals.subtotal < store.min_order;
  const payments: PaymentMethod[] = ["pix", "card", "cash", ...(store.online_payments_enabled ? (["online"] as const) : [])];

  function update<K extends keyof CheckoutValues>(field: K, value: CheckoutValues[K]) {
    setEdits((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const found = validateCheckout(values, totals.total);
    setErrors(found);
    const first = (["fullName", "phone", "address", "changeFor"] as const).find((field) => found[field]);
    if (first) {
      const refs = { fullName: fullNameRef, phone: phoneRef, address: addressRef, changeFor: changeForRef };
      refs[first].current?.focus();
      return;
    }
    startTransition(async () => {
      const result = await placeOrderAction(store.slug, deviceToken(), {
        full_name: values.fullName.trim(),
        phone: digits(values.phone),
        address: values.address.trim(),
        reference_point: values.referencePoint.trim() || null,
        notes: values.notes.trim() || null,
        payment_method: values.payment,
        change_for: values.payment === "cash" && values.changeFor.trim() ? parsePrice(values.changeFor) : null,
        items: toOrderItems(lines),
      });
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      writeStored(PROFILE_KEY, profileToRemember(values));
      onPlaced();
      if (result.data.checkoutUrl) window.location.assign(result.data.checkoutUrl);
      else router.push(`${STORE_PATH}/${store.slug}/pedido/${result.data.id}?novo=1`);
    });
  }

  if (lines.length === 0) {
    return <p className="rounded-3xl border border-dashed border-border-strong p-6 text-center text-muted">Seu carrinho está vazio. Toque em um item do cardápio para adicionar.</p>;
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border">
        {lines.map((line) => (
          <li key={line.key} className="flex items-center gap-3 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{lineLabel(line)}</p>
              <p className="truncate text-sm text-muted">
                {[line.doneness && DONENESS_LABELS[line.doneness], line.notes].filter(Boolean).join(" · ") || formatPrice(line.unitPrice)}
              </p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                aria-label={line.quantity === 1 ? `Remover ${lineLabel(line)}` : `Diminuir ${lineLabel(line)}`}
                onClick={() => onQuantity(line.key, line.quantity - 1)}
                className="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-surface-raised"
              >
                <MinusIcon className="size-4" />
              </button>
              <span className="w-6 text-center text-sm font-semibold">{line.quantity}</span>
              <button
                type="button"
                aria-label={`Aumentar ${lineLabel(line)}`}
                onClick={() => onQuantity(line.key, line.quantity + 1)}
                className="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-surface-raised"
              >
                <PlusIcon className="size-4" />
              </button>
            </div>
            <span className="w-20 text-right text-sm text-accent">{formatPrice(line.unitPrice * line.quantity)}</span>
          </li>
        ))}
      </ul>

      <fieldset className="flex flex-col gap-4" disabled={pending}>
        <legend className="mb-1 font-display text-2xl tracking-wide">Entrega</legend>
        <TextField ref={fullNameRef} label="Seu nome" autoComplete="name" value={values.fullName} error={errors.fullName} onChange={(e) => update("fullName", e.target.value)} />
        <TextField
          ref={phoneRef}
          label="Telefone / WhatsApp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(11) 98888-7777"
          value={values.phone}
          error={errors.phone}
          onChange={(e) => update("phone", maskPhone(e.target.value))}
        />
        <TextField
          ref={addressRef}
          label="Endereço"
          autoComplete="street-address"
          placeholder="Rua, número, complemento e bairro"
          value={values.address}
          error={errors.address}
          onChange={(e) => update("address", e.target.value)}
        />
        <TextField label="Ponto de referência" optional value={values.referencePoint} maxLength={200} onChange={(e) => update("referencePoint", e.target.value)} />
        <TextField label="Observações do pedido" optional maxLength={500} value={values.notes} onChange={(e) => update("notes", e.target.value)} />
      </fieldset>

      <fieldset className="flex flex-col gap-3" disabled={pending}>
        <legend className="mb-1 font-display text-2xl tracking-wide">Pagamento</legend>
        <div className="flex flex-wrap gap-2">
          {payments.map((method) => (
            <Chip key={method} selected={values.payment === method} onClick={() => update("payment", method)}>
              {method === "online" ? "Cartão online" : PAYMENT_LABELS[method]}
            </Chip>
          ))}
        </div>
        {values.payment === "cash" && (
          <TextField
            ref={changeForRef}
            label="Troco para quanto?"
            optional
            inputMode="decimal"
            placeholder="Deixe vazio se não precisar"
            value={values.changeFor}
            error={errors.changeFor}
            onChange={(e) => update("changeFor", e.target.value)}
          />
        )}
        {values.payment === "online" && <p className="text-sm text-muted">Você paga com segurança pela Stripe e volta para acompanhar o pedido.</p>}
      </fieldset>

      <dl className="grid grid-cols-2 gap-y-1 text-sm">
        <dt className="text-muted">Subtotal</dt>
        <dd className="text-right">{formatPrice(totals.subtotal)}</dd>
        <dt className="text-muted">Entrega</dt>
        <dd className="text-right">{totals.deliveryFee ? formatPrice(totals.deliveryFee) : "Grátis"}</dd>
        <dt className="text-base font-semibold">Total</dt>
        <dd className="text-right text-base font-semibold text-accent">{formatPrice(totals.total)}</dd>
      </dl>

      {belowMinimum && <Alert tone="info">Pedido mínimo de {formatPrice(store.min_order ?? 0)}. Falta {formatPrice((store.min_order ?? 0) - totals.subtotal)}.</Alert>}
      {formError && <Alert tone="error">{formError}</Alert>}
      <Button type="submit" disabled={!store.is_open || belowMinimum} loading={pending} loadingLabel="Enviando pedido…">
        {store.is_open ? `Fazer pedido · ${formatPrice(totals.total)}` : "Loja fechada agora"}
      </Button>
    </form>
  );
}
