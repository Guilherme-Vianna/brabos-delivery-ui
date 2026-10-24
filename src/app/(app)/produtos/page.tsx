import type { Metadata } from "next";
import { Suspense } from "react";
import { ApiUnavailable } from "@/components/app/api-unavailable";
import { PageHeader } from "@/components/app/page-header";
import { PageLoading } from "@/components/app/page-loading";
import { ProductBoard } from "@/components/products/product-board";
import { listMyProducts } from "@/lib/api/owner";
import { PRODUCTS_PATH } from "@/lib/auth/constants";
import { requireEstablishment } from "@/lib/auth/current-establishment";

export const metadata: Metadata = {
  title: "Cardápio",
};

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        title="Cardápio"
        description="O que você vende e por quanto. Desative um item para escondê-lo sem perder o histórico."
      />
      <Suspense fallback={<PageLoading label="Carregando cardápio…" />}>
        <ProductsContent />
      </Suspense>
    </>
  );
}

async function ProductsContent() {
  const establishment = await requireEstablishment();
  if (!establishment) return <ApiUnavailable retryHref={PRODUCTS_PATH} />;
  const products = await listMyProducts().catch(() => null);
  if (!products) return <ApiUnavailable retryHref={PRODUCTS_PATH} />;
  return <ProductBoard products={products} />;
}
