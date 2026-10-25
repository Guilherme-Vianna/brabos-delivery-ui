import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ApiUnavailable } from "@/components/app/api-unavailable";
import { PageHeader } from "@/components/app/page-header";
import { PageLoading } from "@/components/app/page-loading";
import { SetupWizard } from "@/components/onboarding/setup-wizard";
import { firstPendingStep, isStepId } from "@/components/onboarding/steps";
import { getOpeningHours, listMyProducts } from "@/lib/api/owner";
import { FIRST_STEPS_PATH } from "@/lib/auth/constants";
import { requireEstablishment } from "@/lib/auth/current-establishment";

export const metadata: Metadata = {
  title: "Primeiros passos",
};

type FirstStepsPageProps = { searchParams: Promise<{ passo?: string }> };

export default function FirstStepsPage({ searchParams }: FirstStepsPageProps) {
  return (
    <>
      <PageHeader title="Primeiros passos" description="Três passos rápidos e sua loja está pronta para receber pedidos." />
      <Suspense fallback={<PageLoading label="Carregando passo a passo…" />}>
        <FirstStepsContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function FirstStepsContent({ searchParams }: FirstStepsPageProps) {
  const establishment = await requireEstablishment();
  if (!establishment) return <ApiUnavailable retryHref={FIRST_STEPS_PATH} />;
  const { passo } = await searchParams;
  await connection();
  let data;
  try {
    data = await Promise.all([listMyProducts(), getOpeningHours()]);
  } catch {
    return <ApiUnavailable retryHref={FIRST_STEPS_PATH} />;
  }
  const [products, hours] = data;
  const initialStep = isStepId(passo)
    ? passo
    : firstPendingStep({ cardapio: products.some((product) => product.active !== false), horarios: hours.days.length > 0 });

  return <SetupWizard products={products} hours={hours.days} slug={establishment.slug} initialStep={initialStep} />;
}
