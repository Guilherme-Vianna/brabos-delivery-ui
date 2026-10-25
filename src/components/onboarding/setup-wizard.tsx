"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { StoreLink } from "@/components/establishment/store-link";
import { OwnerPushButton } from "@/components/push/owner-push-button";
import { QuickAdd } from "@/components/products/quick-add";
import { HoursForm } from "@/components/settings/hours-form";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import type { OpeningDay, Product } from "@/lib/api/types";
import { HOME_PATH, PRODUCTS_PATH, SETTINGS_PATH } from "@/lib/auth/constants";
import { formatPrice } from "@/lib/money";
import { PRODUCT_SUGGESTIONS } from "@/lib/products/validation";
import { STEPS, type StepId } from "./steps";

type SetupWizardProps = {
  products: Product[];
  hours: OpeningDay[];
  slug: string;
  initialStep: StepId;
};

const COPY: Record<StepId, { title: string; description: string }> = {
  cardapio: {
    title: "O que você vende?",
    description: "Toque nas sugestões para montar o cardápio em segundos. Preço, foto e descrição você ajusta depois.",
  },
  horarios: {
    title: "Quando você atende?",
    description: "Fora destes horários o cardápio aparece fechado para o cliente. Ajuste os dias e toque em salvar.",
  },
  divulgar: {
    title: "Tudo pronto para divulgar",
    description: "Mande o link do cardápio para seus clientes e ative o aviso de pedidos novos neste aparelho.",
  },
};

export function SetupWizard({ products, hours, slug, initialStep }: SetupWizardProps) {
  const [index, setIndex] = useState(() => STEPS.findIndex((step) => step.id === initialStep));
  const headingRef = useRef<HTMLHeadingElement>(null);
  const active = products.filter((product) => product.active !== false);
  const done: Record<StepId, boolean> = {
    cardapio: active.length > 0,
    horarios: hours.length > 0,
    divulgar: false,
  };
  const step = STEPS[index];
  const copy = COPY[step.id];
  const names = products.map((product) => product.name.toLocaleLowerCase("pt-BR"));
  const suggestions = PRODUCT_SUGGESTIONS.filter((item) => !names.includes(item.name.toLocaleLowerCase("pt-BR")));

  function go(next: number) {
    setIndex(Math.min(Math.max(next, 0), STEPS.length - 1));
    requestAnimationFrame(() => {
      headingRef.current?.focus();
      headingRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <nav aria-label="Passos">
        <ol className="grid grid-cols-3 gap-2">
          {STEPS.map((item, position) => {
            const current = position === index;
            const complete = done[item.id];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(position)}
                  aria-current={current ? "step" : undefined}
                  className="flex w-full cursor-pointer flex-col gap-2 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <span className={`h-1.5 rounded-full ${current || complete ? "bg-primary" : "bg-border-strong"}`} />
                  <span className={`flex items-center gap-1.5 text-sm font-medium ${current ? "text-ink" : "text-muted"}`}>
                    {complete ? (
                      <CheckIcon className="size-4 text-success" />
                    ) : (
                      <span className="text-xs tabular-nums">{position + 1}.</span>
                    )}
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <section aria-labelledby="wizard-title" className="flex flex-col gap-5 rounded-3xl border border-border bg-surface p-5 sm:p-6">
        <div>
          <p className="text-sm font-medium text-accent">
            Passo {index + 1} de {STEPS.length}
          </p>
          <h2 id="wizard-title" ref={headingRef} tabIndex={-1} className="mt-0.5 scroll-mt-24 font-display text-3xl tracking-wide outline-none">
            {copy.title}
          </h2>
          <p className="mt-1 text-muted">{copy.description}</p>
        </div>

        {step.id === "cardapio" && (
          <>
            {active.length > 0 && (
              <ul aria-label="Itens do cardápio" className="flex flex-col divide-y divide-border rounded-2xl border border-border">
                {active.map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="min-w-0 truncate">{product.name}</span>
                    <span className="shrink-0 text-accent">{formatPrice(product.price)}</span>
                  </li>
                ))}
              </ul>
            )}
            {suggestions.length > 0 && (
              <QuickAdd suggestions={suggestions} title={active.length ? "Adicionar mais" : "Toque para adicionar"} />
            )}
            <p className="text-sm text-muted">
              Quer colocar foto, descrição ou criar do zero?{" "}
              <Link href={PRODUCTS_PATH} className="text-accent underline underline-offset-4">
                Abrir o cardápio completo
              </Link>
            </p>
            <Footer
              next={
                <Button disabled={!done.cardapio} onClick={() => go(index + 1)}>
                  Continuar
                </Button>
              }
              hint={done.cardapio ? null : "Adicione pelo menos um item para continuar."}
              onSkip={() => go(index + 1)}
            />
          </>
        )}

        {step.id === "horarios" && (
          <>
            <HoursForm days={hours} suggestWeek saveLabel="Salvar e continuar" onSaved={() => go(index + 1)} />
            <Footer onBack={() => go(index - 1)} onSkip={() => go(index + 1)} />
          </>
        )}

        {step.id === "divulgar" && (
          <>
            <ul className="flex flex-col gap-2 rounded-2xl border border-border p-4 text-sm">
              <Summary done={done.cardapio} label="Cardápio" fix="Adicionar itens" onFix={() => go(0)} />
              <Summary done={done.horarios} label="Horários de funcionamento" fix="Definir horários" onFix={() => go(1)} />
            </ul>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-muted">Link do seu cardápio</p>
              <StoreLink slug={slug} />
            </div>
            <div className="flex flex-col gap-3 border-t border-border pt-4">
              <p className="text-sm text-muted">Receba um aviso neste aparelho a cada pedido novo.</p>
              <OwnerPushButton />
            </div>
            <Footer
              onBack={() => go(index - 1)}
              next={
                <Link
                  href={HOME_PATH}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 font-semibold text-on-primary shadow-lg shadow-black/30 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Ir para os pedidos
                </Link>
              }
            />
            <p className="text-center text-sm text-muted">
              Mais opções, como cores e entregadores, ficam em{" "}
              <Link href={SETTINGS_PATH} className="text-accent underline underline-offset-4">
                Ajustes
              </Link>
              .
            </p>
          </>
        )}
      </section>

      <Link href={HOME_PATH} className="self-center rounded-sm text-sm text-muted underline underline-offset-4 hover:text-ink">
        Sair do passo a passo
      </Link>
    </div>
  );
}

function Summary({ done, label, fix, onFix }: { done: boolean; label: string; fix: string; onFix: () => void }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className={`inline-flex items-center gap-2 ${done ? "text-ink" : "text-muted"}`}>
        {done ? <CheckIcon className="size-4 text-success" /> : <span aria-hidden="true" className="size-4 rounded-full border border-border-strong" />}
        {label}
      </span>
      {!done && (
        <button type="button" onClick={onFix} className="cursor-pointer rounded-sm text-accent underline underline-offset-4">
          {fix}
        </button>
      )}
    </li>
  );
}

function Footer({
  next,
  hint,
  onBack,
  onSkip,
}: {
  next?: ReactNode;
  hint?: string | null;
  onBack?: () => void;
  onSkip?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {hint && <p className="text-center text-sm text-muted">{hint}</p>}
      {next}
      {(onBack || onSkip) && (
        <div className="flex items-center justify-between gap-3">
          {onBack ? (
            <Button variant="ghost" block={false} onClick={onBack}>
              Voltar
            </Button>
          ) : (
            <span />
          )}
          {onSkip && (
            <Button variant="ghost" block={false} onClick={onSkip}>
              Pular por agora
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
