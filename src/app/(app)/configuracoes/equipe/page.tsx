import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ApiUnavailable } from "@/components/app/api-unavailable";
import { PageLoading } from "@/components/app/page-loading";
import { SETTINGS_BLOCKS } from "@/components/settings/blocks";
import { CouriersPanel } from "@/components/settings/couriers-panel";
import { Section, SettingsGrid, SettingsSubpageHeader } from "@/components/settings/settings-section";
import { listCouriers } from "@/lib/api/owner";
import { SETTINGS_PATH } from "@/lib/auth/constants";
import { requireEstablishment } from "@/lib/auth/current-establishment";

const block = SETTINGS_BLOCKS.team;

export const metadata: Metadata = {
  title: block.title,
};

export default function TeamSettingsPage() {
  return (
    <>
      <SettingsSubpageHeader backHref={SETTINGS_PATH} title={block.title} description={block.description} />
      <Suspense fallback={<PageLoading label="Carregando ajustes…" />}>
        <TeamSettingsContent />
      </Suspense>
    </>
  );
}

async function TeamSettingsContent() {
  const establishment = await requireEstablishment();
  if (!establishment) return <ApiUnavailable retryHref={block.href} />;
  await connection();
  const couriers = await listCouriers().catch(() => null);
  if (!couriers) return <ApiUnavailable retryHref={block.href} />;

  return (
    <SettingsGrid>
      <Section id="entregadores" title="Entregadores" description="Eles veem os pedidos aceitos e confirmam a entrega.">
        <CouriersPanel couriers={couriers} />
      </Section>
    </SettingsGrid>
  );
}
