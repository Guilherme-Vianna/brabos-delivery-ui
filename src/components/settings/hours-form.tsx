"use client";

import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { OpeningDay } from "@/lib/api/types";
import { saveHoursAction } from "@/lib/establishment/actions";
import { isTime } from "@/lib/time";

const WEEKDAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

type Row = { open: boolean; opensAt: string; closesAt: string };

function toRows(days: OpeningDay[]): Row[] {
  return WEEKDAYS.map((_, weekday) => {
    const day = days.find((item) => item.weekday === weekday);
    return day
      ? { open: true, opensAt: day.opens_at.slice(0, 5), closesAt: day.closes_at.slice(0, 5) }
      : { open: false, opensAt: "18:00", closesAt: "23:30" };
  });
}

export function HoursForm({ days }: { days: OpeningDay[] }) {
  const [rows, setRows] = useState<Row[]>(() => toRows(days));
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function update(index: number, change: Partial<Row>) {
    setMessage(null);
    setRows((current) => current.map((row, position) => (position === index ? { ...row, ...change } : row)));
  }

  function copyToAll(index: number) {
    const source = rows[index];
    setRows((current) => current.map((row) => (row.open ? { ...row, opensAt: source.opensAt, closesAt: source.closesAt } : row)));
  }

  function save() {
    const invalid = rows.findIndex((row) => row.open && (!isTime(row.opensAt) || !isTime(row.closesAt) || row.opensAt === row.closesAt));
    if (invalid >= 0) {
      setMessage({ tone: "error", text: `Confira o horário de ${WEEKDAYS[invalid].toLowerCase()}: abertura e fechamento precisam ser diferentes.` });
      return;
    }
    const payload = rows.flatMap((row, weekday) =>
      row.open ? [{ weekday, opens_at: row.opensAt, closes_at: row.closesAt }] : [],
    );
    startTransition(async () => {
      const result = await saveHoursAction(payload);
      setMessage(result.ok ? { tone: "success", text: "Horários salvos. Valem para todas as semanas." } : { tone: "error", text: result.error });
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border">
        {rows.map((row, index) => (
          <li key={WEEKDAYS[index]} className="flex flex-wrap items-center gap-3 px-4 py-2">
            <div className="w-36">
              <Switch checked={row.open} onChange={(open) => update(index, { open })} label={WEEKDAYS[index]} />
            </div>
            {row.open ? (
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <TimeInput label={`${WEEKDAYS[index]}: abre`} value={row.opensAt} onChange={(opensAt) => update(index, { opensAt })} />
                <span className="text-muted">até</span>
                <TimeInput label={`${WEEKDAYS[index]}: fecha`} value={row.closesAt} onChange={(closesAt) => update(index, { closesAt })} />
                {row.closesAt < row.opensAt && <span className="text-xs text-muted">(vira a madrugada)</span>}
                <button
                  type="button"
                  onClick={() => copyToAll(index)}
                  className="ml-auto cursor-pointer rounded-full px-2 py-1 text-sm text-accent underline-offset-4 hover:underline"
                >
                  Usar em todos
                </button>
              </div>
            ) : (
              <span className="text-sm text-muted">Fechado</span>
            )}
          </li>
        ))}
      </ul>
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <Button className="sm:w-auto sm:self-start" loading={pending} loadingLabel="Salvando…" onClick={save}>
        Salvar horários
      </Button>
    </div>
  );
}

function TimeInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <input
      type="time"
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 rounded-full border border-border-strong bg-surface px-4 text-ink focus:border-accent focus:outline-2 focus:outline-accent"
    />
  );
}
