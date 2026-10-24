"use client";

import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import type { Absence } from "@/lib/api/types";
import { createAbsenceAction, deleteAbsenceAction } from "@/lib/establishment/actions";
import { addDays, dateKey, formatShortDate, formatTime, zonedIso } from "@/lib/time";

const DURATIONS = [
  { label: "30 min", minutes: 30 },
  { label: "1 hora", minutes: 60 },
  { label: "2 horas", minutes: 120 },
  { label: "Resto do dia", minutes: null },
];

const REASONS = ["Muito movimento", "Falta de ingrediente", "Problema técnico", "Sem entregador"];

function when(iso: string, today: string): string {
  const day = dateKey(iso);
  return day === today ? formatTime(iso) : `${formatShortDate(day)} ${formatTime(iso)}`;
}

export function AbsencePanel({ absences, today }: { absences: Absence[]; today: string }) {
  const [duration, setDuration] = useState<number | null>(60);
  const [reason, setReason] = useState(REASONS[0]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function pause() {
    setError(null);
    const start = new Date();
    const end = duration === null ? zonedIso(addDays(dateKey(start), 1), "04:00") : new Date(start.getTime() + duration * 60_000).toISOString();
    startTransition(async () => {
      const result = await createAbsenceAction(start.toISOString(), end, reason);
      if (!result.ok) setError(result.error);
    });
  }

  function reopen(absenceId: string) {
    startTransition(async () => {
      const result = await deleteAbsenceAction(absenceId);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {absences.length > 0 && (
        <ul className="flex flex-col gap-2">
          {absences.map((absence) => (
            <li key={absence.id} className="flex items-center justify-between gap-3 rounded-2xl border border-primary/50 bg-primary-soft px-4 py-3">
              <div>
                <p className="font-medium">Pausado até {when(absence.ends_at, today)}</p>
                <p className="text-sm text-muted">
                  Desde {when(absence.starts_at, today)}
                  {absence.reason && ` · ${absence.reason}`}
                </p>
              </div>
              <Button variant="secondary" block={false} disabled={pending} onClick={() => reopen(absence.id)}>
                Reabrir
              </Button>
            </li>
          ))}
        </ul>
      )}
      {error && <Alert tone="error">{error}</Alert>}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Pausar pedidos por</span>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((item) => (
            <Chip key={item.label} selected={duration === item.minutes} onClick={() => setDuration(item.minutes)}>
              {item.label}
            </Chip>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Motivo (o cliente vê)</span>
        <div className="flex flex-wrap gap-2">
          {REASONS.map((item) => (
            <Chip key={item} selected={reason === item} onClick={() => setReason(item)}>
              {item}
            </Chip>
          ))}
        </div>
      </div>
      <Button variant="danger" className="sm:w-auto sm:self-start" loading={pending} loadingLabel="Pausando…" onClick={pause}>
        Pausar pedidos agora
      </Button>
    </div>
  );
}
