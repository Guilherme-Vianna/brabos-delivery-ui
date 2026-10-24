import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageLoading } from "@/components/app/page-loading";
import { OrderTracker } from "@/components/store/order-tracker";
import { getStore } from "@/lib/api/public";
import { STORE_PATH } from "@/lib/auth/constants";

export const metadata: Metadata = {
  title: "Acompanhar pedido",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function TrackingPage(props: PageProps<"/e/[slug]/pedido/[id]">) {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6 pb-16">
      <Suspense fallback={<PageLoading label="Buscando seu pedido…" />}>
        <TrackingContent {...props} />
      </Suspense>
    </main>
  );
}

async function TrackingContent({ params, searchParams }: PageProps<"/e/[slug]/pedido/[id]">) {
  const { slug, id } = await params;
  const query = await searchParams;
  const store = await getStore(slug).catch(() => null);
  if (!store || !UUID.test(id)) {
    return <p className="text-muted">Pedido não encontrado. Confira o link.</p>;
  }
  return (
    <div className="flex flex-col gap-6">
      <Link href={`${STORE_PATH}/${store.slug}`} className="text-sm text-muted hover:text-ink">
        ← {store.name}
      </Link>
      <OrderTracker
        store={store}
        orderId={id}
        justPlaced={query.novo === "1"}
        payment={typeof query.pagamento === "string" ? query.pagamento : null}
      />
    </div>
  );
}
