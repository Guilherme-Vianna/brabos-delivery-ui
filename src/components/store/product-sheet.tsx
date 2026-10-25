"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { MinusIcon, PlusIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/modal";
import { TextField } from "@/components/ui/text-field";
import type { Doneness, Product } from "@/lib/api/types";
import { buildLine, DONENESS_LABELS, MAX_QUANTITY, needsDoneness, unitPrice, type CartLine } from "@/lib/cart";
import { formatPrice } from "@/lib/money";
import { ProductGallery } from "./product-gallery";

type ProductSheetProps = {
  product: Product | null;
  products: Product[];
  disabled: boolean;
  onClose: () => void;
  onAdd: (line: CartLine) => void;
};

export function ProductSheet({ product, products, disabled, onClose, onAdd }: ProductSheetProps) {
  return (
    <Modal open={product !== null} onClose={onClose} title={product?.name ?? ""} wide>
      {product && (
        <ProductOptions
          key={product.id}
          product={product}
          halves={products.filter((item) => item.allows_half && item.id !== product.id && product.allows_half)}
          disabled={disabled}
          onAdd={(line) => {
            onAdd(line);
            onClose();
          }}
        />
      )}
    </Modal>
  );
}

function ProductOptions({
  product,
  halves,
  disabled,
  onAdd,
}: {
  product: Product;
  halves: Product[];
  disabled: boolean;
  onAdd: (line: CartLine) => void;
}) {
  const [half, setHalf] = useState<Product | null>(null);
  const [doneness, setDoneness] = useState<Doneness | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [showError, setShowError] = useState(false);
  const asks = needsDoneness(product, half);
  const price = unitPrice(product, half);
  const missingDoneness = asks && doneness === null;

  function add() {
    if (missingDoneness) {
      setShowError(true);
      return;
    }
    onAdd(buildLine(product, half, quantity, doneness, notes));
  }

  return (
    <div className="flex flex-col gap-5">
      <ProductGallery name={product.name} urls={product.image_urls.length ? product.image_urls : product.image_url ? [product.image_url] : []} />
      {(product.description || product.ingredients) && (
        <div className="text-sm text-muted">
          {product.description && <p>{product.description}</p>}
          {product.ingredients && <p className="mt-1">{product.ingredients}</p>}
        </div>
      )}

      {halves.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">Meio a meio? <span className="font-normal text-muted">cobra a metade mais cara</span></legend>
          <div className="flex flex-wrap gap-2">
            <Chip selected={half === null} onClick={() => setHalf(null)}>
              Inteiro
            </Chip>
            {halves.map((item) => (
              <Chip key={item.id} selected={half?.id === item.id} onClick={() => setHalf(item)}>
                ½ {item.name}
                {item.price > product.price && <span className="text-xs opacity-80">+{formatPrice(item.price - product.price)}</span>}
              </Chip>
            ))}
          </div>
        </fieldset>
      )}

      {asks && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">
            Ponto da carne <span className="text-primary">*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(DONENESS_LABELS) as Doneness[]).map((value) => (
              <Chip
                key={value}
                selected={doneness === value}
                onClick={() => {
                  setDoneness(value);
                  setShowError(false);
                }}
              >
                {DONENESS_LABELS[value]}
              </Chip>
            ))}
          </div>
          {showError && missingDoneness && (
            <p role="alert" className="text-sm text-danger">
              Escolha o ponto da carne para continuar.
            </p>
          )}
        </fieldset>
      )}

      <TextField
        label="Alguma observação?"
        optional
        placeholder="Ex.: sem cebola, molho à parte"
        maxLength={200}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-border-strong">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            disabled={quantity <= 1}
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="flex size-12 cursor-pointer items-center justify-center rounded-full disabled:opacity-40"
          >
            <MinusIcon />
          </button>
          <span aria-live="polite" className="w-8 text-center font-semibold">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Aumentar quantidade"
            disabled={quantity >= MAX_QUANTITY}
            onClick={() => setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))}
            className="flex size-12 cursor-pointer items-center justify-center rounded-full disabled:opacity-40"
          >
            <PlusIcon />
          </button>
        </div>
        <Button disabled={disabled} onClick={add}>
          {disabled ? "Loja fechada" : `Adicionar · ${formatPrice(price * quantity)}`}
        </Button>
      </div>
    </div>
  );
}
