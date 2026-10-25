import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/app/page-header";
import { ChevronRightIcon } from "@/components/ui/icons";

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="mb-2 -ml-2 inline-flex h-10 items-center gap-1 rounded-full px-2 text-sm text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
    >
      <ChevronRightIcon className="size-5 rotate-180" />
      {children}
    </Link>
  );
}

export function SettingsSubpageHeader({ backHref, title, description }: { backHref: string; title: string; description: string }) {
  return (
    <>
      <BackLink href={backHref}>Voltar para Ajustes</BackLink>
      <PageHeader title={title} description={description} />
    </>
  );
}

export function SettingsGrid({ children }: { children: ReactNode }) {
  return <div className="grid items-start gap-6 lg:grid-cols-2">{children}</div>;
}

export function Section({
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
      className={`flex scroll-mt-24 flex-col gap-4 rounded-3xl border border-border bg-surface p-5 sm:p-6 ${wide ? "lg:col-span-2" : ""}`}
    >
      <div>
        <h2 id={`${id}-title`} className="font-display text-2xl tracking-wide">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}
