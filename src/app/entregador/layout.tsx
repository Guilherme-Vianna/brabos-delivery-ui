import Link from "next/link";
import { SessionRefresher } from "@/components/auth/session-refresher";
import { Logo } from "@/components/brand/logo";
import { COURIER_PATH } from "@/lib/auth/constants";

export default function CourierLayout({ children }: LayoutProps<"/entregador">) {
  return (
    <div className="flex flex-1 flex-col">
      <SessionRefresher />
      <header className="sticky top-0 z-10 border-b border-border bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href={COURIER_PATH} aria-label="Ir para as entregas" className="rounded-lg">
            <Logo />
          </Link>
          <span className="rounded-full bg-primary-soft px-3 py-1 text-sm">Entregador</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-16 sm:px-6">{children}</main>
    </div>
  );
}
