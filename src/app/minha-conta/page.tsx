import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { PageLoading } from "@/components/app/page-loading";
import { SessionRefresher } from "@/components/auth/session-refresher";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Logo } from "@/components/brand/logo";
import { CustomerProfileForm } from "@/components/customer/customer-profile-form";
import { getCustomerProfile, listCustomerOrders } from "@/lib/api/public";
import { LOGIN_PATH, STORE_PATH } from "@/lib/auth/constants";
import { getSessionUser } from "@/lib/auth/session";
import { maskPhone } from "@/lib/establishment/validation";
import { formatPrice } from "@/lib/money";
import { STATUS_LABELS } from "@/lib/orders";
import { dateKey, formatShortDate } from "@/lib/time";

export const metadata: Metadata = {
  title: "Minha conta",
};

export default function CustomerPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SessionRefresher />
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center px-4">
          <Logo />
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pt-6 pb-16">
        <PageHeader title="Minha conta" description="Seus pedidos em todas as lojas e seus dados de entrega." />
        <Suspense fallback={<PageLoading label="Carregando seus pedidos…" />}>
          <CustomerContent />
        </Suspense>
      </main>
    </div>
  );
}

async function CustomerContent() {
  const user = await getSessionUser();
  if (!user) redirect(LOGIN_PATH);
  const [profile, orders] = await Promise.all([
    getCustomerProfile().catch(() => null),
    listCustomerOrders().catch(() => ({ items: [], total: 0 })),
  ]);
  const stores = new Map<string, { name: string; count: number }>();
  for (const order of orders.items) {
    if (order.status !== "delivered") continue;
    const current = stores.get(order.establishment_slug) ?? { name: order.establishment_name, count: 0 };
    stores.set(order.establishment_slug, { ...current, count: current.count + 1 });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <section aria-labelledby="orders-title" className="flex flex-col gap-3">
        <h2 id="orders-title" className="font-display text-3xl tracking-wide">
          Pedidos
        </h2>
        {orders.items.length === 0 ? (
          <p className="text-muted">Você ainda não fez pedidos com esta conta.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {orders.items.map((order) => (
              <li key={order.id}>
                <Link
                  href={`${STORE_PATH}/${order.establishment_slug}/pedido/${order.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 hover:border-accent/60"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {order.establishment_name} · #{order.number}
                    </span>
                    <span className="block text-sm text-muted">
                      {formatShortDate(dateKey(order.created_at))} · {STATUS_LABELS[order.status]}
                    </span>
                  </span>
                  <span className="shrink-0 text-accent">{formatPrice(order.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {stores.size > 0 && (
          <div className="mt-2 rounded-3xl border border-accent/40 bg-accent-soft p-4 text-sm">
            <p className="font-semibold text-accent">Sua fidelidade</p>
            <ul className="mt-1">
              {[...stores.entries()].map(([slug, store]) => (
                <li key={slug}>
                  <Link href={`${STORE_PATH}/${slug}`} className="underline underline-offset-4">
                    {store.name}
                  </Link>
                  : {store.count} {store.count === 1 ? "pedido entregue" : "pedidos entregues"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      <section aria-labelledby="profile-title" className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5">
        <h2 id="profile-title" className="font-display text-3xl tracking-wide">
          Meus dados
        </h2>
        <CustomerProfileForm
          initial={{
            fullName: profile?.full_name ?? user.name ?? "",
            phone: profile ? maskPhone(profile.phone) : "",
            address: profile?.address ?? "",
            referencePoint: profile?.reference_point ?? "",
          }}
        />
        <div>
          <SignOutButton />
        </div>
      </section>
    </div>
  );
}
