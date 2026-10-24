"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { BurgerIcon, CartIcon, SearchIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/modal";
import type { Product, PublicEstablishment } from "@/lib/api/types";
import { CUSTOMER_PATH, LOGIN_PATH, NEXT_PARAM, STORE_PATH } from "@/lib/auth/constants";
import { addLine, cartTotals, setQuantity, syncWithMenu, type CartLine } from "@/lib/cart";
import type { CheckoutValues } from "@/lib/customer/checkout";
import { useStoredString } from "@/lib/customer/stored";
import { formatPrice } from "@/lib/money";
import { CheckoutPanel } from "./checkout-panel";
import { MyRecentOrders } from "./my-recent-orders";
import { ProductSheet } from "./product-sheet";

type StoreFrontProps = {
  store: PublicEstablishment;
  products: Product[];
  closedNote: string | null;
  profile: Partial<CheckoutValues> | null;
  signedIn: boolean;
};

const OTHERS = "Outros";

function parseCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function StoreFront({ store, products, closedNote, profile, signedIn }: StoreFrontProps) {
  const cartKey = `brabos:cart:${store.slug}`;
  const [rawCart, setRawCart] = useStoredString(cartKey);
  const lines = useMemo(() => syncWithMenu(parseCart(rawCart), products), [rawCart, products]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const totals = cartTotals(lines, { enabled: store.delivery_fee_enabled, value: store.delivery_fee });

  const groups = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("pt-BR");
    const map = new Map<string, Product[]>();
    for (const product of products) {
      const haystack = `${product.name} ${product.ingredients} ${product.description}`.toLocaleLowerCase("pt-BR");
      if (needle && !haystack.includes(needle)) continue;
      const key = product.category || OTHERS;
      map.set(key, [...(map.get(key) ?? []), product]);
    }
    const first = (items: Product[]) => Math.min(...items.map((item) => item.position));
    return [...map.entries()].sort(([, a], [, b]) => first(a) - first(b));
  }, [products, query]);

  function save(next: CartLine[]) {
    setRawCart(next.length ? JSON.stringify(next) : null);
  }

  const checkout = (
    <CheckoutPanel
      store={store}
      lines={lines}
      profile={profile}
      onQuantity={(key, quantity) => save(setQuantity(lines, key, quantity))}
      onPlaced={() => {
        save([]);
        setCartOpen(false);
      }}
    />
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-32 sm:px-6 lg:pb-12">
      <header className="flex items-start gap-4">
        <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary text-on-primary">
          {store.logo_url ? (
            <Image src={store.logo_url} alt="" fill unoptimized sizes="64px" className="object-cover" />
          ) : (
            <BurgerIcon className="size-8" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-4xl leading-none tracking-wide sm:text-5xl">{store.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium ${
                store.is_open ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
              }`}
            >
              <span aria-hidden="true" className={`size-2 rounded-full ${store.is_open ? "bg-success" : "bg-danger"}`} />
              {store.is_open ? "Aberto agora" : "Fechado"}
            </span>
            <span>Entrega {store.delivery_fee_enabled && store.delivery_fee ? formatPrice(store.delivery_fee) : "grátis"}</span>
            {store.min_order !== null && <span>· Mínimo {formatPrice(store.min_order)}</span>}
          </p>
        </div>
        <Link
          href={signedIn ? CUSTOMER_PATH : `${LOGIN_PATH}?${NEXT_PARAM}=${encodeURIComponent(`${STORE_PATH}/${store.slug}`)}`}
          className="hidden shrink-0 rounded-full border border-border-strong px-4 py-2 text-sm text-muted hover:text-ink sm:inline-flex"
        >
          {signedIn ? "Meus pedidos" : "Entrar"}
        </Link>
      </header>

      {closedNote && (
        <p role="status" className="mt-4 rounded-2xl border border-primary/50 bg-primary-soft px-4 py-3 text-sm">
          {closedNote}
        </p>
      )}

      <MyRecentOrders slug={store.slug} />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="sticky top-0 z-10 -mx-4 flex flex-col gap-3 bg-canvas/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <label className="relative">
              <span className="sr-only">Buscar no cardápio</span>
              <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
              <input
                type="search"
                placeholder="Buscar no cardápio"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-12 w-full rounded-full border border-border-strong bg-surface pr-4 pl-12 text-ink placeholder:text-muted focus:border-accent focus:outline-2 focus:outline-accent"
              />
            </label>
            {groups.length > 1 && (
              <nav aria-label="Categorias" className="scrollbar-none flex gap-2 overflow-x-auto">
                {groups.map(([category]) => (
                  <a
                    key={category}
                    href={`#cat-${encodeURIComponent(category)}`}
                    className="inline-flex h-10 shrink-0 items-center rounded-full border border-border-strong px-4 text-sm hover:border-accent"
                  >
                    {category}
                  </a>
                ))}
              </nav>
            )}
          </div>

          {groups.length === 0 && <p className="text-muted">{products.length ? "Nada encontrado com essa busca." : "O cardápio ainda está sendo montado."}</p>}

          {groups.map(([category, items]) => (
            <section key={category} id={`cat-${encodeURIComponent(category)}`} className="scroll-mt-36" aria-labelledby={`title-${category}`}>
              <h2 id={`title-${category}`} className="mb-3 font-display text-3xl tracking-wide">
                {category}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {items.map((product) => {
                  const inCart = lines.filter((line) => line.productId === product.id).reduce((sum, line) => sum + line.quantity, 0);
                  return (
                    <li key={product.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(product)}
                        className="flex h-full w-full cursor-pointer items-stretch gap-3 rounded-3xl border border-border bg-surface p-3 text-left transition-colors hover:border-accent/60 focus-visible:outline-2 focus-visible:outline-accent"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold">{product.name}</span>
                          {(product.description || product.ingredients) && (
                            <span className="mt-1 line-clamp-2 block text-sm text-muted">{product.description || product.ingredients}</span>
                          )}
                          <span className="mt-2 flex items-center gap-2 text-sm">
                            <span className="font-semibold text-accent">{formatPrice(product.price)}</span>
                            {product.allows_half && <span className="text-xs text-muted">· meio a meio</span>}
                            {inCart > 0 && <span className="rounded-full bg-primary px-2 text-xs font-bold text-on-primary">{inCart} no carrinho</span>}
                          </span>
                        </span>
                        {product.image_url && (
                          <span className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-surface-raised">
                            <Image src={product.image_url} alt="" fill unoptimized sizes="96px" className="object-cover" />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <aside aria-label="Seu pedido" className="hidden lg:block">
          <div className="sticky top-6 max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-3xl border border-border bg-surface p-5">
            <h2 className="mb-4 font-display text-3xl tracking-wide">Seu pedido</h2>
            {checkout}
          </div>
        </aside>
      </div>

      {totals.count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-canvas/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
          <Button onClick={() => setCartOpen(true)} icon={<CartIcon className="size-5" />}>
            Ver carrinho ({totals.count}) · {formatPrice(totals.total)}
          </Button>
        </div>
      )}

      <Modal open={cartOpen} onClose={() => setCartOpen(false)} title="Seu pedido" wide>
        {checkout}
      </Modal>

      <ProductSheet
        product={selected}
        products={products}
        disabled={!store.is_open}
        onClose={() => setSelected(null)}
        onAdd={(line) => save(addLine(lines, line))}
      />
    </div>
  );
}
