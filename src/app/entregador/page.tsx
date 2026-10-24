import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ApiUnavailable } from "@/components/app/api-unavailable";
import { PageHeader } from "@/components/app/page-header";
import { PageLoading } from "@/components/app/page-loading";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DeliveryList } from "@/components/courier/delivery-list";
import { PushBridge } from "@/components/push/push-bridge";
import { CourierPushButton } from "@/components/push/owner-push-button";
import { ApiError } from "@/lib/api/client";
import { listCourierOrders, listMyMemberships } from "@/lib/api/public";
import { COURIER_PATH, LOGIN_PATH } from "@/lib/auth/constants";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Entregas",
};

export default function CourierPage() {
  return (
    <>
      <PageHeader title="Entregas" description="Pedidos aceitos pela loja, prontos para sair." />
      <Suspense fallback={<PageLoading label="Carregando entregas…" />}>
        <CourierContent />
      </Suspense>
    </>
  );
}

async function CourierContent() {
  if (!(await getSessionUser())) redirect(LOGIN_PATH);
  let data;
  try {
    data = await Promise.all([listMyMemberships(), listCourierOrders()]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(LOGIN_PATH);
    return <ApiUnavailable retryHref={COURIER_PATH} />;
  }
  const [memberships, orders] = data;
  if (memberships.length === 0) {
    return (
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6">
        <p className="font-display text-3xl tracking-wide">Você ainda não entrega para nenhuma loja</p>
        <p className="text-muted">Peça o link de convite para o dono da loja e abra-o neste aparelho.</p>
        <div>
          <SignOutButton />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <PushBridge role="courier" />
      <DeliveryList orders={orders.items} memberships={memberships} />
      <section className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-5">
        <p className="text-sm text-muted">Entregando para: {memberships.map((item) => item.establishment_name).join(", ")}</p>
        <CourierPushButton />
        <div>
          <SignOutButton />
        </div>
      </section>
    </div>
  );
}
