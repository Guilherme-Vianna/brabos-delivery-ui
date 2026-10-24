import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { HOME_PATH, SETTINGS_PATH } from "@/lib/auth/constants";
import { loadCurrentEstablishment } from "@/lib/auth/current-establishment";
import { APP_NAME } from "@/lib/brand";
import { initialsOf } from "@/lib/people";
import { TopNav } from "./nav-items";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          href={HOME_PATH}
          aria-label={`${APP_NAME}, ir para os pedidos`}
          className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <Logo />
        </Link>
        <Suspense fallback={<span aria-hidden="true" className="size-10 animate-pulse rounded-full bg-surface-raised" />}>
          <HeaderAccount />
        </Suspense>
      </div>
    </header>
  );
}

async function HeaderAccount() {
  const { user, establishment } = await loadCurrentEstablishment();
  const name = establishment ? establishment.name : user.name || user.email || "Conta";
  return (
    <div className="flex items-center gap-3">
      {establishment && <TopNav />}
      <Link
        href={SETTINGS_PATH}
        aria-label={`Seu estabelecimento: ${name}`}
        title={name}
        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/60 bg-primary-soft text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {initialsOf(name)}
      </Link>
    </div>
  );
}
