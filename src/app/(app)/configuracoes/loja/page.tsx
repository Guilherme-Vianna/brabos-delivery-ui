import type { Metadata } from "next";
import { Suspense } from "react";
import { ApiUnavailable } from "@/components/app/api-unavailable";
import { PageLoading } from "@/components/app/page-loading";
import { ProfileForm } from "@/components/establishment/profile-form";
import { StoreLink } from "@/components/establishment/store-link";
import { OwnerPushButton } from "@/components/push/owner-push-button";
import { SETTINGS_BLOCKS } from "@/components/settings/blocks";
import { LogoForm } from "@/components/settings/logo-form";
import { Section, SettingsGrid, SettingsSubpageHeader } from "@/components/settings/settings-section";
import { ThemeForm } from "@/components/settings/theme-form";
import { SETTINGS_PATH } from "@/lib/auth/constants";
import { requireEstablishment } from "@/lib/auth/current-establishment";
import { maskCnpj, maskPhone } from "@/lib/establishment/validation";

const block = SETTINGS_BLOCKS.store;

export const metadata: Metadata = {
  title: block.title,
};

export default function StoreSettingsPage() {
  return (
    <>
      <SettingsSubpageHeader backHref={SETTINGS_PATH} title={block.title} description={block.description} />
      <Suspense fallback={<PageLoading label="Carregando ajustes…" />}>
        <StoreSettingsContent />
      </Suspense>
    </>
  );
}

async function StoreSettingsContent() {
  const establishment = await requireEstablishment();
  if (!establishment) return <ApiUnavailable retryHref={block.href} />;

  return (
    <SettingsGrid>
      <Section id="link" title="Link do cardápio" description="Divulgue no Instagram, WhatsApp e Google.">
        <StoreLink slug={establishment.slug} />
        <div className="border-t border-border pt-4">
          <p className="mb-3 text-sm text-muted">Receba um aviso neste aparelho a cada pedido novo.</p>
          <OwnerPushButton />
        </div>
      </Section>
      <Section id="dados" title="Dados da loja" description="Nome, telefone, endereço e logo.">
        <LogoForm logoUrl={establishment.logo_url} />
        <ProfileForm
          mode="edit"
          initial={{
            name: establishment.name,
            phone: maskPhone(establishment.phone),
            address: establishment.address,
            cnpj: establishment.cnpj ? maskCnpj(establishment.cnpj) : "",
            slug: establishment.slug,
          }}
        />
      </Section>
      <Section id="aparencia" title="Cores do cardápio" description="Como seus clientes veem a tela de pedido." wide>
        <ThemeForm name={establishment.name} primary={establishment.primary_color} accent={establishment.accent_color} />
      </Section>
    </SettingsGrid>
  );
}
