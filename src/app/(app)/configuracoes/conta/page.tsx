import type { Metadata } from "next";
import { Suspense } from "react";
import { ApiUnavailable } from "@/components/app/api-unavailable";
import { PageLoading } from "@/components/app/page-loading";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SETTINGS_BLOCKS } from "@/components/settings/blocks";
import { DangerZone } from "@/components/settings/danger-zone";
import { Section, SettingsGrid, SettingsSubpageHeader } from "@/components/settings/settings-section";
import { SETTINGS_PATH } from "@/lib/auth/constants";
import { requireEstablishment } from "@/lib/auth/current-establishment";

const block = SETTINGS_BLOCKS.account;

export const metadata: Metadata = {
  title: block.title,
};

export default function AccountSettingsPage() {
  return (
    <>
      <SettingsSubpageHeader backHref={SETTINGS_PATH} title={block.title} description={block.description} />
      <Suspense fallback={<PageLoading label="Carregando ajustes…" />}>
        <AccountSettingsContent />
      </Suspense>
    </>
  );
}

async function AccountSettingsContent() {
  const establishment = await requireEstablishment();
  if (!establishment) return <ApiUnavailable retryHref={block.href} />;

  return (
    <SettingsGrid>
      <Section id="conta" title="Sair ou excluir" description="Sair encerra a sessão neste aparelho. Excluir apaga a loja.">
        <div className="flex flex-wrap gap-3">
          <SignOutButton />
          <DangerZone name={establishment.name} />
        </div>
      </Section>
    </SettingsGrid>
  );
}
