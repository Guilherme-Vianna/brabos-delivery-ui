"use client";

import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CartIcon } from "@/components/ui/icons";
import { accentContrast, buttonContrast, COLOR_PRESETS, MIN_CONTRAST, storeTheme } from "@/lib/color";
import { updateSettingsAction } from "@/lib/establishment/actions";

type ThemeFormProps = { name: string; primary: string; accent: string };

export function ThemeForm({ name, primary: initialPrimary, accent: initialAccent }: ThemeFormProps) {
  const [primary, setPrimary] = useState(initialPrimary);
  const [accent, setAccent] = useState(initialAccent);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const changed = primary !== initialPrimary || accent !== initialAccent;
  const weakButton = buttonContrast(primary) < MIN_CONTRAST;
  const weakAccent = accentContrast(accent) < 3;

  function save() {
    setMessage(null);
    startTransition(async () => {
      const result = await updateSettingsAction({ primary_color: primary.toUpperCase(), accent_color: accent.toUpperCase() });
      setMessage(result.ok ? { tone: "success", text: "Cores aplicadas no seu cardápio." } : { tone: "error", text: result.error });
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Combinações prontas">
          {COLOR_PRESETS.map((preset) => {
            const selected = preset.primary === primary.toUpperCase() && preset.accent === accent.toUpperCase();
            return (
              <button
                key={preset.name}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setPrimary(preset.primary);
                  setAccent(preset.accent);
                }}
                className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl border px-3 text-sm focus-visible:outline-2 focus-visible:outline-accent ${
                  selected ? "border-ink bg-surface-raised" : "border-border-strong"
                }`}
              >
                <span className="flex">
                  <span className="size-5 rounded-full border border-black/30" style={{ background: preset.primary }} />
                  <span className="-ml-1.5 size-5 rounded-full border border-black/30" style={{ background: preset.accent }} />
                </span>
                {preset.name}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ColorInput label="Cor principal" hint="Botões e destaques" value={primary} onChange={setPrimary} />
          <ColorInput label="Cor de apoio" hint="Preços e seleção" value={accent} onChange={setAccent} />
        </div>
        {(weakButton || weakAccent) && (
          <Alert tone="info">
            {weakButton && "A cor principal deixa o texto dos botões difícil de ler. "}
            {weakAccent && "A cor de apoio some no fundo escuro. "}
            Escolha um tom mais forte para todos conseguirem ler.
          </Alert>
        )}
        {message && <Alert tone={message.tone}>{message.text}</Alert>}
        <Button className="sm:w-auto sm:self-start" disabled={!changed} loading={pending} loadingLabel="Aplicando…" onClick={save}>
          Aplicar cores
        </Button>
      </div>

      <div aria-label="Pré-visualização do cardápio" style={storeTheme(primary, accent)} className="rounded-3xl border border-border bg-canvas p-4">
        <p className="text-xs tracking-wide text-muted uppercase">Pré-visualização</p>
        <p className="mt-2 font-display text-3xl tracking-wide">{name}</p>
        <span className="mt-1 inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs text-ink">Aberto agora</span>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-surface p-3">
          <div>
            <p className="font-medium">X-Bacon</p>
            <p className="text-sm text-accent">R$ 30,00</p>
          </div>
          <span className="rounded-full border border-accent px-3 py-1 text-sm text-accent">Ao ponto</span>
        </div>
        <div className="mt-4 flex h-12 items-center justify-between rounded-full bg-primary px-5 font-semibold text-on-primary">
          <span className="inline-flex items-center gap-2">
            <CartIcon className="size-5" /> Ver carrinho
          </span>
          <span>R$ 30,00</span>
        </div>
      </div>
    </div>
  );
}

function ColorInput({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex cursor-pointer flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <span className="flex h-12 items-center gap-3 rounded-full border border-border-strong bg-surface px-2 focus-within:outline-2 focus-within:outline-accent">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="size-9 cursor-pointer rounded-full border-0 bg-transparent p-0"
        />
        <span className="font-mono text-sm">{value.toUpperCase()}</span>
      </span>
      <span className="px-1 text-sm text-muted">{hint}</span>
    </label>
  );
}
