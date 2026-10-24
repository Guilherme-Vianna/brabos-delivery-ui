import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { ApiUnavailable } from "@/components/app/api-unavailable";
import { PageHeader } from "@/components/app/page-header";
import { PageLoading } from "@/components/app/page-loading";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ProfileForm } from "@/components/establishment/profile-form";
import { StoreLink } from "@/components/establishment/store-link";
import { OwnerPushButton } from "@/components/push/owner-push-button";
import { AbsencePanel } from "@/components/settings/absence-panel";
import { CouriersPanel } from "@/components/settings/couriers-panel";
import { DangerZone } from "@/components/settings/danger-zone";
import { DeliverySettings } from "@/components/settings/delivery-settings";
import { HoursForm } from "@/components/settings/hours-form";
import { LogoForm } from "@/components/settings/logo-form";
import { ThemeForm } from "@/components/settings/theme-form";
import { getOpeningHours, listAbsences, listCouriers } from "@/lib/api/owner";
import { SETTINGS_PATH } from "@/lib/auth/constants";
import { requireEstablishment } from "@/lib/auth/current-establishment";
import { maskCnpj, maskPhone } from "@/lib/establishment/validation";
import { dateKey } from "@/lib/time";

export const metadata: Metadata = {
  title: "Ajustes",
};

const sections = [
  { id: "link", label: "Link" },
  { id: "pausar", label: "Pausar" },
  { id: "entrega", label: "Entrega" },
  { id: "horarios", label: "Horários" },
  { id: "aparencia", label: "Cores" },
  { id: "entregadores", label: "Entregadores" },
  { id: "dados", label: "Dados" },
  { id: "conta", label: "Conta" },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Ajustes" description="Tudo da sua loja em um lugar. As mudanças valem na hora." />
      <nav aria-label="Seções" className="scrollbar-none sticky top-16 z-[5] -mx-4 mb-6 flex gap-2 overflow-x-auto bg-canvas/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="inline-flex h-10 shrink-0 items-center rounded-full border border-border-strong px-4 text-sm text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
          >
            {section.label}
          </a>
        ))}
      </nav>
      <Suspense fallback={<PageLoading label="Carregando ajustes…" />}>
        <SettingsContent />
      </Suspense>
    </>
  );
}

async function SettingsContent() {
  const establishment = await requireEstablishment();
  if (!establishment) return <ApiUnavailable retryHref={SETTINGS_PATH} />;
  await connection();
  let data;
  try {
    data = await Promise.all([getOpeningHours(), listAbsences(), listCouriers()]);
  } catch {
    return <ApiUnavailable retryHref={SETTINGS_PATH} />;
  }
  const [hours, absences, couriers] = data;
  const today = dateKey(new Date());

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section id="link" title="Link do cardápio" description="Divulgue no Instagram, WhatsApp e Google.">
        <StoreLink slug={establishment.slug} />
        <div className="border-t border-border pt-4">
          <p className="mb-3 text-sm text-muted">Receba um aviso neste aparelho a cada pedido novo.</p>
          <OwnerPushButton />
        </div>
      </Section>
      <Section id="pausar" title="Pausar pedidos" description="Imprevisto? Feche o cardápio por um tempo sem mexer nos horários.">
        <AbsencePanel absences={absences} today={today} />
      </Section>
      <Section id="entrega" title="Entrega e pedidos">
        <DeliverySettings establishment={establishment} />
      </Section>
      <Section id="horarios" title="Horário de funcionamento" description="Fora destes horários o cardápio aparece fechado.">
        <HoursForm days={hours.days} />
      </Section>
      <Section id="aparencia" title="Cores do cardápio" description="Como seus clientes veem a tela de pedido." wide>
        <ThemeForm name={establishment.name} primary={establishment.primary_color} accent={establishment.accent_color} />
      </Section>
      <Section id="entregadores" title="Entregadores" description="Eles veem os pedidos aceitos e confirmam a entrega.">
        <CouriersPanel couriers={couriers} />
      </Section>
      <Section id="dados" title="Dados da loja">
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
      <Section id="conta" title="Conta">
        <div className="flex flex-wrap gap-3">
          <SignOutButton />
          <DangerZone name={establishment.name} />
        </div>
      </Section>
    </div>
  );
}

function Section({
  id,
  title,
  description,
  wide = false,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`flex scroll-mt-32 flex-col gap-4 rounded-3xl border border-border bg-surface p-5 sm:p-6 ${wide ? "lg:col-span-2" : ""}`}
    >
      <div>
        <h2 id={`${id}-title`} className="font-display text-3xl tracking-wide">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}
