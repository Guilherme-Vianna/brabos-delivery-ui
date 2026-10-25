import Image from "next/image";
import { BurgerIcon, StarIcon } from "@/components/ui/icons";
import type { Product } from "@/lib/api/types";
import { formatPrice } from "@/lib/money";

type FeaturedShelfProps = {
  products: Product[];
  onSelect: (product: Product) => void;
};

export const FEATURED_ANCHOR = "destaques";

export function FeaturedShelf({ products, onSelect }: FeaturedShelfProps) {
  return (
    <section id={FEATURED_ANCHOR} aria-labelledby="featured-title" className="scroll-mt-36">
      <h2 id="featured-title" className="mb-3 flex items-center gap-2 font-display text-3xl tracking-wide">
        <StarIcon className="size-6 text-accent" /> Destaques
      </h2>
      <ul className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {products.map((product) => (
          <li key={product.id} className="w-64 shrink-0 snap-start sm:w-72">
            <button
              type="button"
              onClick={() => onSelect(product)}
              className="flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-accent/50 bg-surface text-left transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-accent"
            >
              <span className="relative flex aspect-[16/10] w-full items-center justify-center bg-surface-raised text-muted">
                {product.image_url ? (
                  <Image src={product.image_url} alt="" fill unoptimized sizes="288px" className="object-cover" />
                ) : (
                  <BurgerIcon className="size-10" />
                )}
              </span>
              <span className="flex flex-1 flex-col gap-1 p-3">
                <span className="font-semibold">{product.name}</span>
                {(product.description || product.ingredients) && (
                  <span className="line-clamp-2 text-sm text-muted">{product.description || product.ingredients}</span>
                )}
                <span className="mt-auto pt-1 font-semibold text-accent">{formatPrice(product.price)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
