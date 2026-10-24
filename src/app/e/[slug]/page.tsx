import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { PageLoading } from "@/components/app/page-loading";
import { StoreFront } from "@/components/store/store-front";
import { ApiError } from "@/lib/api/client";
import { getCustomerProfile, getStore, getStoreHours, listStoreProducts } from "@/lib/api/public";
import { getSessionUser } from "@/lib/auth/session";
import type { CheckoutValues } from "@/lib/customer/checkout";
import { maskPhone } from "@/lib/establishment/validation";
import { localClock, nextOpening } from "@/lib/store-hours";
import { formatTime, TIME_ZONE } from "@/lib/time";

export async function generateMetadata({ params }: PageProps<"/e/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore(slug).catch(() => null);
  return { title: store ? `${store.name} · Cardápio` : "Cardápio" };
}

export default function StorePage({ params }: PageProps<"/e/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-6xl px-4 py-8"><PageLoading label="Abrindo o cardápio…" /></div>}>
      <StoreContent params={params} />
    </Suspense>
  );
}

async function StoreContent({ params }: Pick<PageProps<"/e/[slug]">, "params">) {
  const { slug } = await params;
  await connection();
  let data;
  try {
    data = await Promise.all([getStore(slug), listStoreProducts(slug), getStoreHours(slug)]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return <Problem title="Loja não encontrada">Confira se o link foi copiado inteiro.</Problem>;
    }
    return <Problem title="Não conseguimos abrir o cardápio">Verifique sua internet e atualize a página.</Problem>;
  }
  const [store, products, hours] = data;
  const user = await getSessionUser();
  const customer = user ? await getCustomerProfile().catch(() => null) : null;
  const profile: Partial<CheckoutValues> | null = customer
    ? {
        fullName: customer.full_name,
        phone: maskPhone(customer.phone),
        address: customer.address ?? "",
        referencePoint: customer.reference_point ?? "",
      }
    : user?.name
      ? { fullName: user.name }
      : null;

  let closedNote: string | null = null;
  if (!store.is_open) {
    if (store.absence_ends_at) {
      closedNote = `Pausado${store.absence_reason ? ` (${store.absence_reason.toLowerCase()})` : ""}. Voltamos às ${formatTime(store.absence_ends_at)}. Você pode montar o carrinho enquanto isso.`;
    } else {
      const clock = localClock(new Date(), TIME_ZONE);
      const next = nextOpening(hours.days, clock.weekday, clock.minute);
      closedNote = `Estamos fechados agora. ${next ? `${next}.` : ""} Você pode montar o carrinho enquanto isso.`;
    }
  }

  return <StoreFront store={store} products={products} closedNote={closedNote} profile={profile} signedIn={Boolean(user)} />;
}

function Problem({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto mt-16 w-full max-w-md px-4">
      <div className="rounded-3xl border border-border bg-surface p-8 text-center">
        <h1 className="font-display text-4xl tracking-wide">{title}</h1>
        <p className="mt-2 text-muted">{children}</p>
      </div>
    </div>
  );
}
