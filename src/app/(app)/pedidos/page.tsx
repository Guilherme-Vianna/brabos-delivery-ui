import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ApiUnavailable } from "@/components/app/api-unavailable";
import { PageHeader } from "@/components/app/page-header";
import { PageLoading } from "@/components/app/page-loading";
import { StoreLink } from "@/components/establishment/store-link";
import { OrderBoard } from "@/components/orders/order-board";
import { CheckIcon } from "@/components/ui/icons";
import { getOpeningHours, listMyProducts, listOrders } from "@/lib/api/owner";
import { FIRST_STEPS_PATH, HOME_PATH } from "@/lib/auth/constants";
import { requireEstablishment } from "@/lib/auth/current-establishment";
import { dateKey, zonedIso } from "@/lib/time";

export const metadata: Metadata = {
  title: "Pedidos",
};

export default function OrdersPage() {
  return (
    <Suspense fallback={<PageLoading label="Carregando pedidos…" />}>
      <OrdersContent />
    </Suspense>
  );
}

async function OrdersContent() {
  const establishment = await requireEstablishment();
  if (!establishment) return <ApiUnavailable retryHref={HOME_PATH} />;
  await connection();
  const now = new Date();
  const startOfDay = zonedIso(dateKey(now), "00:00");
  let data;
  try {
    data = await Promise.all([
      listOrders(["placed", "accepted"]),
      listOrders(["delivered", "cancelled"], startOfDay, undefined, 50),
      listMyProducts(),
      getOpeningHours(),
    ]);
  } catch {
    return <ApiUnavailable retryHref={HOME_PATH} />;
  }
  const [active, done, products, hours] = data;
  const steps = [
    { done: products.some((product) => product.active !== false), label: "Cadastre seu cardápio", href: `${FIRST_STEPS_PATH}?passo=cardapio` },
    { done: hours.days.length > 0, label: "Defina os horários de funcionamento", href: `${FIRST_STEPS_PATH}?passo=horarios` },
  ];

  return (
    <>
      <PageHeader title="Pedidos" actions={<StoreLink slug={establishment.slug} compact />} />
      {steps.some((step) => !step.done) && (
        <section aria-label="Primeiros passos" className="mb-6 rounded-3xl border border-primary/50 bg-primary-soft p-5">
          <p className="font-display text-2xl tracking-wide">Falta pouco para receber pedidos</p>
          <ol className="mt-3 flex flex-col gap-2">
            {steps.map((step) => (
              <li key={step.label}>
                {step.done ? (
                  <span className="inline-flex items-center gap-2 text-muted line-through">
                    <CheckIcon /> {step.label}
                  </span>
                ) : (
                  <Link href={step.href} className="font-semibold text-ink underline underline-offset-4">
                    {step.label} →
                  </Link>
                )}
              </li>
            ))}
          </ol>
          <Link
            href={FIRST_STEPS_PATH}
            className="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 font-semibold text-on-primary shadow-lg shadow-black/30 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Começar o passo a passo
          </Link>
        </section>
      )}
      <OrderBoard orders={[...active.items, ...done.items]} nowIso={now.toISOString()} />
    </>
  );
}
