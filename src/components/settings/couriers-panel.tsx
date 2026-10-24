"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CopyIcon, PlusIcon, ShareIcon } from "@/components/ui/icons";
import { Switch } from "@/components/ui/switch";
import type { Courier, CourierInvite } from "@/lib/api/types";
import { createInviteAction, setCourierActiveAction } from "@/lib/establishment/actions";
import { formatPhone } from "@/lib/orders";

export function CouriersPanel({ couriers }: { couriers: Courier[] }) {
  const [invite, setInvite] = useState<CourierInvite | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function generate() {
    setError(null);
    startTransition(async () => {
      const result = await createInviteAction();
      if (result.ok) setInvite(result.data);
      else setError(result.error);
    });
  }

  async function share(url: string) {
    if (navigator.share) {
      await navigator.share({ title: "Convite de entregador", text: "Use este link para entrar como entregador:", url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
  }

  return (
    <div className="flex flex-col gap-4">
      {couriers.length > 0 ? (
        <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border">
          {couriers.map((courier) => (
            <CourierRow key={courier.id} courier={courier} onError={setError} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">Nenhum entregador ainda. Gere um link e envie pelo WhatsApp.</p>
      )}
      {error && <Alert tone="error">{error}</Alert>}
      {invite ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-accent/50 bg-accent-soft p-4">
          <p className="text-sm">
            Link de uso único, válido por 7 dias. O entregador entra com a conta Google ou e-mail dele.
          </p>
          <p className="truncate font-mono text-sm text-accent">{invite.url}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" block={false} icon={<ShareIcon />} onClick={() => share(invite.url)}>
              Enviar convite
            </Button>
            <Button
              variant="ghost"
              block={false}
              icon={<CopyIcon />}
              onClick={async () => {
                await navigator.clipboard.writeText(invite.url);
                setCopied(true);
              }}
            >
              {copied ? "Copiado!" : "Copiar"}
            </Button>
            <Button variant="ghost" block={false} icon={<PlusIcon />} loading={pending} loadingLabel="Gerando…" onClick={generate}>
              Outro link
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" className="sm:w-auto sm:self-start" block={false} icon={<PlusIcon />} loading={pending} loadingLabel="Gerando…" onClick={generate}>
          Convidar entregador
        </Button>
      )}
    </div>
  );
}

function CourierRow({ courier, onError }: { courier: Courier; onError: (message: string) => void }) {
  const [active, setActive] = useOptimistic(courier.active);
  const [, startTransition] = useTransition();
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-2">
      <div className="min-w-0">
        <p className="truncate font-medium">{courier.name}</p>
        {courier.phone && <p className="text-sm text-muted">{formatPhone(courier.phone)}</p>}
      </div>
      <Switch
        checked={active}
        hideLabel
        label={active ? `${courier.name} ativo` : `${courier.name} desativado`}
        onChange={(checked) =>
          startTransition(async () => {
            setActive(checked);
            const result = await setCourierActiveAction(courier.id, checked);
            if (!result.ok) onError(result.error);
          })
        }
      />
    </li>
  );
}
