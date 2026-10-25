"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { PlusIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/money";
import { quickAddProductAction } from "@/lib/products/actions";
import type { PRODUCT_SUGGESTIONS } from "@/lib/products/validation";

export function QuickAdd({ suggestions, title = "Adicionar com um toque" }: { suggestions: typeof PRODUCT_SUGGESTIONS; title?: string }) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function add(item: (typeof PRODUCT_SUGGESTIONS)[number]) {
    setPending(item.name);
    setError(null);
    const result = await quickAddProductAction(item);
    if (!result.ok) setError(result.error);
    setPending(null);
  }

  return (
    <section aria-labelledby="quick-add" className="flex flex-col gap-3">
      <h2 id="quick-add" className="text-sm font-medium text-muted">
        {title}
      </h2>
      {error && <Alert tone="error">{error}</Alert>}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item.name}
            type="button"
            disabled={pending !== null}
            onClick={() => add(item)}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl border border-border-strong bg-surface-raised px-4 text-sm hover:border-accent/70 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
          >
            <PlusIcon className="size-4 text-accent" />
            {pending === item.name ? "Adicionando…" : item.name}
            <span className="text-muted">{formatPrice(item.price)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
