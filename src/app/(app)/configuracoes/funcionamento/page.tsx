import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ApiUnavailable } from "@/components/app/api-unavailable";
import { PageLoading } from "@/components/app/page-loading";
import { AbsencePanel } from "@/components/settings/absence-panel";
import { SETTINGS_BLOCKS } from "@/components/settings/blocks";
import { DeliverySettings } from "@/components/settings/delivery-settings";
import { HoursForm } from "@/components/settings/hours-form";
import { Section, SettingsGrid, SettingsSubpageHeader } from "@/components/settings/settings-section";
import { getOpeningHours, listAbsences } from "@/lib/api/owner";
import { SETTINGS_PATH } from "@/lib/auth/constants";
import { requireEstablishment } from "@/lib/auth/current-establishment";
import { dateKey } from "@/lib/time";

const block = SETTINGS_BLOCKS.operation;

export const metadata: Metadata = {
  title: block.title,
};

export default function OperationSettingsPage() {
  return (
    <>
      <SettingsSubpageHeader backHref={SETTINGS_PATH} title={block.title} description={block.description} />
      <Suspense fallback={<PageLoading label="Carregando ajustes…" />}>
        <OperationSettingsContent />
      </Suspense>
    </>
  );
}

async function OperationSettingsContent() {
  const establishment = await requireEstablishment();
  if (!establishment) return <ApiUnavailable retryHref={block.href} />;
  await connection();
  let data;
  try {
    data = await Promise.all([getOpeningHours(), listAbsences()]);
  } catch {
    return <ApiUnavailable retryHref={block.href} />;
  }
  const [hours, absences] = data;
  const today = dateKey(new Date());

  return (
    <SettingsGrid>
      <Section id="horarios" title="Horário de funcionamento" description="Fora destes horários o cardápio aparece fechado.">
        <HoursForm days={hours.days} />
      </Section>
      <div className="flex flex-col gap-6">
        <Section id="pausar" title="Pausar pedidos" description="Imprevisto? Feche o cardápio por um tempo sem mexer nos horários.">
          <AbsencePanel absences={absences} today={today} />
        </Section>
        <Section id="entrega" title="Entrega e pedidos" description="Taxa, pedido mínimo, aceite automático e pagamento online.">
          <DeliverySettings establishment={establishment} />
        </Section>
      </div>
    </SettingsGrid>
  );
}
