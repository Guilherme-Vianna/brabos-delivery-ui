import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/brand/logo";
import { BellIcon, ChartIcon, ReceiptIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Entrar",
};

const highlights = [
  { icon: ReceiptIcon, title: "Pedidos em tempo real", text: "Aceite com um toque e acompanhe até a entrega." },
  { icon: BellIcon, title: "Notificação no celular", text: "Chegou pedido, o aparelho avisa — mesmo fechado." },
  { icon: ChartIcon, title: "Financeiro na mão", text: "Saiba o que mais vende e quanto entrou no dia." },
];

export default function LoginPage() {
  return (
    <div className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(ellipse_at_top,rgba(214,40,40,0.38),transparent_65%)]"
      />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-8">
        <header>
          <Logo />
        </header>

        <main className="grid flex-1 items-start gap-12 py-8 sm:py-12 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-center lg:gap-20">
          <section aria-labelledby="login-title" className="w-full max-w-md">
            <p className="text-sm font-semibold tracking-wide text-accent uppercase">Para hamburguerias e entregadores</p>
            <h1 id="login-title" className="mt-3 font-display text-5xl tracking-wide text-ink sm:text-6xl">
              Seu delivery, sem comissão
            </h1>
            <p className="mt-4 text-lg text-muted">
              Cardápio com link próprio, pedidos chegando na hora e entregadores confirmando a entrega pelo celular.
            </p>
            <div className="mt-8">
              <LoginForm />
            </div>
          </section>

          <ul className="hidden gap-4 lg:grid">
            {highlights.map((item) => (
              <li key={item.title} className="flex items-start gap-4 rounded-3xl border border-border bg-surface p-6">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <item.icon className="size-6" />
                </span>
                <div>
                  <p className="font-display text-2xl tracking-wide text-ink">{item.title}</p>
                  <p className="mt-1 text-muted">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}
