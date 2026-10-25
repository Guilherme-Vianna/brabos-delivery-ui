"use client";

import Image from "next/image";
import { useMemo, useOptimistic, useRef, useState, useTransition, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { BurgerIcon, PlusIcon, SearchIcon, StarIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { TextField } from "@/components/ui/text-field";
import { MAX_FEATURED_PRODUCTS, type Product } from "@/lib/api/types";
import { formatPrice, priceInputValue } from "@/lib/money";
import { deleteProductAction, saveProductAction, setProductActiveAction } from "@/lib/products/actions";
import { ImageGallery } from "./image-gallery";
import { QuickAdd } from "./quick-add";
import {
  PRODUCT_SUGGESTIONS,
  validateProduct,
  type ProductErrors,
  type ProductValues,
} from "@/lib/products/validation";

type Editing = { mode: "new"; category?: string } | { mode: "edit"; product: Product } | null;

const UNCATEGORIZED = "Outros";

export function ProductBoard({ products }: { products: Product[] }) {
  const [editing, setEditing] = useState<Editing>(null);
  const [query, setQuery] = useState("");
  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [products],
  );
  const groups = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("pt-BR");
    const map = new Map<string, Product[]>();
    for (const product of products) {
      if (needle && !product.name.toLocaleLowerCase("pt-BR").includes(needle)) continue;
      const key = product.category || UNCATEGORIZED;
      map.set(key, [...(map.get(key) ?? []), product]);
    }
    return [...map.entries()];
  }, [products, query]);
  const names = products.map((product) => product.name.toLocaleLowerCase("pt-BR"));
  const suggestions = PRODUCT_SUGGESTIONS.filter((item) => !names.includes(item.name.toLocaleLowerCase("pt-BR")));

  return (
    <div className="flex flex-col gap-6">
      {products.length > 6 && (
        <TextField
          label="Buscar no cardápio"
          type="search"
          placeholder="Nome do produto"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          trailing={<SearchIcon className="mr-3 size-5 text-muted" />}
        />
      )}

      {products.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border-strong p-6 text-center">
          <p className="font-display text-2xl tracking-wide">Seu cardápio está vazio</p>
          <p className="mt-1 text-muted">Toque nas sugestões para começar rápido — dá para ajustar preço e foto depois.</p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {groups.map(([category, items]) => (
          <section key={category} aria-labelledby={`category-${category}`} className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <h2 id={`category-${category}`} className="font-display text-2xl tracking-wide">
                {category} <span className="text-base text-muted">({items.length})</span>
              </h2>
              <Button
                variant="ghost"
                block={false}
                className="h-10 text-sm"
                icon={<PlusIcon className="size-4" />}
                onClick={() => setEditing({ mode: "new", category: category === UNCATEGORIZED ? "" : category })}
              >
                Adicionar
              </Button>
            </div>
            <ul className="flex flex-col gap-2">
              {items.map((product) => (
                <ProductRow key={product.id} product={product} onEdit={() => setEditing({ mode: "edit", product })} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {products.length > 0 && (
        <p className="text-sm text-muted">
          Destaques no cardápio: {products.filter((product) => product.featured).length} de {MAX_FEATURED_PRODUCTS}. Marque na edição do item.
        </p>
      )}

      {suggestions.length > 0 && <QuickAdd suggestions={suggestions} />}

      <div className="fixed right-4 bottom-20 z-20 md:static md:max-w-xs">
        <Button className="shadow-2xl md:shadow-lg" icon={<PlusIcon />} onClick={() => setEditing({ mode: "new" })}>
          Novo produto
        </Button>
      </div>

      <ProductDialog
        key={editing?.mode === "edit" ? editing.product.id : `new-${editing?.mode === "new" ? editing.category ?? "" : ""}`}
        editing={editing}
        categories={categories}
        featureSlotFree={products.filter((product) => product.featured && !(editing?.mode === "edit" && product.id === editing.product.id)).length < MAX_FEATURED_PRODUCTS}
        otherNames={products
          .filter((product) => editing?.mode !== "edit" || product.id !== editing.product.id)
          .map((product) => product.name)}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

function ProductRow({ product, onEdit }: { product: Product; onEdit: () => void }) {
  const [active, setActive] = useOptimistic(product.active !== false);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(next: boolean) {
    setError(null);
    startTransition(async () => {
      setActive(next);
      const result = await setProductActiveAction(product.id, next);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <li className={`rounded-2xl border border-border bg-surface ${active ? "" : "opacity-60"}`}>
      <div className="flex items-center gap-3 p-2 pr-4">
        <button
          type="button"
          onClick={onEdit}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl p-1 text-left focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-raised text-muted">
            {product.image_url ? (
              <Image src={product.image_url} alt="" fill unoptimized sizes="56px" className="object-cover" />
            ) : (
              <BurgerIcon className="size-6" />
            )}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 font-medium text-ink">
              <span className="truncate">{product.name}</span>
              {product.featured && <StarIcon className="size-4 shrink-0 text-accent" label="Destaque" />}
            </span>
            <span className="block text-sm text-accent">
              {formatPrice(product.price)}
              <span className="text-muted">
                {product.allows_half && " · meio a meio"}
                {product.asks_doneness && " · ponto da carne"}
              </span>
            </span>
          </span>
        </button>
        <Switch
          checked={active}
          onChange={toggle}
          hideLabel
          label={active ? `${product.name} visível no cardápio` : `${product.name} oculto do cardápio`}
        />
      </div>
      {error && <p className="px-4 pb-3 text-sm text-danger">{error}</p>}
    </li>
  );
}

function initialValues(editing: Editing): ProductValues {
  if (editing?.mode === "edit") {
    const product = editing.product;
    return {
      name: product.name,
      price: priceInputValue(product.price),
      category: product.category,
      description: product.description,
      ingredients: product.ingredients,
      allowsHalf: product.allows_half,
      asksDoneness: product.asks_doneness,
      featured: product.featured,
      images: (product.image_keys ?? []).map((key, index) => ({ key, url: product.image_urls[index] })),
    };
  }
  return {
    name: "",
    price: "",
    category: editing?.mode === "new" ? (editing.category ?? "") : "",
    description: "",
    ingredients: "",
    allowsHalf: false,
    asksDoneness: false,
    featured: false,
    images: [],
  };
}

type ProductDialogProps = {
  editing: Editing;
  categories: string[];
  otherNames: string[];
  featureSlotFree: boolean;
  onClose: () => void;
};

function ProductDialog({ editing, categories, otherNames, featureSlotFree, onClose }: ProductDialogProps) {
  const [values, setValues] = useState<ProductValues>(() => initialValues(editing));
  const [errors, setErrors] = useState<ProductErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const listId = "product-categories";

  function update<K extends keyof ProductValues>(field: K, value: ProductValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    if (field in errors) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const found = validateProduct(values, otherNames);
    setErrors(found);
    if (found.name) return nameRef.current?.focus();
    if (found.price) return priceRef.current?.focus();
    if (Object.keys(found).length) return;
    startTransition(async () => {
      const result = await saveProductAction(editing?.mode === "edit" ? editing.product.id : null, values);
      if (result.ok) onClose();
      else {
        setErrors(result.fieldErrors);
        setFormError(result.formError);
      }
    });
  }

  return (
    <Modal
      open={editing !== null}
      onClose={onClose}
      locked={pending}
      wide
      title={editing?.mode === "edit" ? "Editar produto" : "Novo produto"}
    >
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        {formError && <Alert tone="error">{formError}</Alert>}
        <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
          <TextField
            ref={nameRef}
            label="Nome"
            placeholder="Ex.: X-Bacon"
            value={values.name}
            error={errors.name}
            disabled={pending}
            onChange={(event) => update("name", event.target.value)}
          />
          <TextField
            ref={priceRef}
            label="Preço"
            inputMode="decimal"
            placeholder="29,90"
            value={values.price}
            error={errors.price}
            disabled={pending}
            onChange={(event) => update("price", event.target.value)}
          />
        </div>
        <TextField
          label="Categoria"
          optional
          list={listId}
          placeholder="Ex.: Lanches, Bebidas"
          value={values.category}
          error={errors.category}
          disabled={pending}
          onChange={(event) => update("category", event.target.value)}
        />
        <datalist id={listId}>
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
        <TextField
          label="Ingredientes"
          optional
          placeholder="Pão brioche, blend 160g, cheddar…"
          value={values.ingredients}
          error={errors.ingredients}
          disabled={pending}
          onChange={(event) => update("ingredients", event.target.value)}
        />
        <TextField
          label="Descrição"
          optional
          placeholder="O que deixa ele especial"
          value={values.description}
          error={errors.description}
          disabled={pending}
          onChange={(event) => update("description", event.target.value)}
        />
        <div className="grid gap-2 rounded-2xl border border-border p-4 sm:grid-cols-2 sm:gap-6">
          <Switch
            checked={values.allowsHalf}
            onChange={(checked) => update("allowsHalf", checked)}
            disabled={pending}
            label="Permite meio a meio"
            description="Cobra a metade mais cara"
          />
          <Switch
            checked={values.asksDoneness}
            onChange={(checked) => update("asksDoneness", checked)}
            disabled={pending}
            label="Pergunta o ponto da carne"
            description="Cliente escolhe ao pedir"
          />
        </div>
        <Switch
          checked={values.featured}
          onChange={(checked) => update("featured", checked)}
          disabled={pending || (!values.featured && !featureSlotFree)}
          label="Destacar no cardápio"
          description={
            featureSlotFree || values.featured
              ? `Aparece no topo para o cliente. Até ${MAX_FEATURED_PRODUCTS} itens, bom para combos.`
              : `Você já destacou ${MAX_FEATURED_PRODUCTS} itens. Tire o destaque de outro para escolher este.`
          }
        />
        <ImageGallery images={values.images} disabled={pending} onChange={(images) => update("images", images)} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {editing?.mode === "edit" ? (
            <ConfirmDialog
              trigger={(open) => (
                <Button variant="dangerGhost" disabled={pending} onClick={open}>
                  Excluir produto
                </Button>
              )}
              title={`Excluir ${editing.product.name}?`}
              description="Some do cardápio para sempre. Se já foi pedido, desative em vez de excluir."
              confirmLabel="Excluir"
              pendingLabel="Excluindo…"
              onConfirm={async () => {
                const result = await deleteProductAction(editing.product.id);
                if (result.ok) onClose();
                return result.ok ? { ok: true } : result;
              }}
            />
          ) : (
            <span />
          )}
          <Button type="submit" className="sm:w-auto" loading={pending} loadingLabel="Salvando…">
            {editing?.mode === "edit" ? "Salvar alterações" : "Adicionar ao cardápio"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
