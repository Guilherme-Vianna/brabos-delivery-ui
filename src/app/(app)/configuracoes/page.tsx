import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { BackLink } from "@/components/settings/settings-section";
import { SETTINGS_BLOCKS } from "@/components/settings/blocks";
import { ChevronRightIcon } from "@/components/ui/icons";
import { HOME_PATH } from "@/lib/auth/constants";

export const metadata: Metadata = {
  title: "Ajustes",
};

export default function SettingsPage() {
  return (
    <>
      <BackLink href={HOME_PATH}>Voltar para os pedidos</BackLink>
      <PageHeader title="Ajustes" description="Escolha o que quer mudar. As mudanças valem na hora." />
      <nav aria-label="Ajustes">
        <ul className="grid gap-3 md:grid-cols-2">
          {Object.values(SETTINGS_BLOCKS).map((block) => (
            <li key={block.href}>
              <Link
                href={block.href}
                className="flex min-h-[4.5rem] items-center gap-4 rounded-3xl border border-border bg-surface p-4 transition-colors hover:border-accent/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <block.icon className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-2xl leading-none tracking-wide">{block.title}</span>
                  <span className="mt-1 block truncate text-sm text-muted">{block.summary}</span>
                </span>
                <ChevronRightIcon className="size-5 shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
