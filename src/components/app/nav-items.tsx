"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BurgerIcon, ChartIcon, HistoryIcon, ReceiptIcon, SettingsIcon } from "@/components/ui/icons";
import {
  FINANCE_PATH,
  HISTORY_PATH,
  HOME_PATH,
  PRODUCTS_PATH,
  SETTINGS_PATH,
  SIGNUP_PATH,
} from "@/lib/auth/constants";

const items = [
  { href: HOME_PATH, label: "Pedidos", icon: ReceiptIcon },
  { href: PRODUCTS_PATH, label: "Cardápio", icon: BurgerIcon },
  { href: FINANCE_PATH, label: "Financeiro", icon: ChartIcon },
  { href: HISTORY_PATH, label: "Histórico", icon: HistoryIcon },
  { href: SETTINGS_PATH, label: "Ajustes", icon: SettingsIcon },
];

function useCurrent() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav() {
  const isCurrent = useCurrent();
  return (
    <nav aria-label="Principal" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const current = isCurrent(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:px-4 ${
                  current ? "bg-primary-soft text-ink" : "text-muted hover:bg-surface-raised hover:text-ink"
                }`}
              >
                <item.icon className={`size-5 ${current ? "text-primary" : ""}`} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function BottomNav() {
  const isCurrent = useCurrent();
  if (isCurrent(SIGNUP_PATH)) return null;
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const current = isCurrent(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent ${
                  current ? "text-ink" : "text-muted"
                }`}
              >
                <span
                  className={`flex h-8 w-12 items-center justify-center rounded-full ${current ? "bg-primary-soft text-primary" : ""}`}
                >
                  <item.icon className="size-6" />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
