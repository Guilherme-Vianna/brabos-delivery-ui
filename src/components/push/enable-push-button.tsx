"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BellIcon, CheckIcon } from "@/components/ui/icons";
import { pushSupport, requestPushToken, type PushSupport } from "@/lib/push/client";
import type { ActionResult } from "@/lib/actions";

type EnablePushButtonProps = {
  register: (token: string) => Promise<ActionResult>;
  label?: string;
  variant?: "primary" | "secondary";
};

const BLOCKED =
  "As notificações estão bloqueadas neste navegador. Libere em Configurações do site › Notificações e toque de novo.";

export function EnablePushButton({ register, label = "Ativar notificações", variant = "secondary" }: EnablePushButtonProps) {
  const [support, setSupport] = useState<PushSupport | "checking">("checking");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    pushSupport().then(setSupport);
  }, []);

  async function enable() {
    setPending(true);
    setMessage(null);
    try {
      const token = await requestPushToken();
      if (!token) {
        setSupport(await pushSupport());
        setMessage({ tone: "error", text: BLOCKED });
        return;
      }
      const result = await register(token);
      if (result.ok) {
        setSupport("granted");
        setMessage({ tone: "success", text: "Pronto! Você vai receber um aviso neste aparelho." });
      } else {
        setMessage({ tone: "error", text: result.error });
      }
    } catch {
      setMessage({ tone: "error", text: "Não foi possível ativar agora. Tente de novo." });
    } finally {
      setPending(false);
    }
  }

  if (support === "checking") return null;
  if (support === "unsupported" || support === "unconfigured") {
    return (
      <p className="text-sm text-muted">
        {support === "unsupported"
          ? "Este navegador não recebe notificações. No iPhone, adicione o app à Tela de Início primeiro."
          : "Notificações ainda não configuradas neste ambiente."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      {support === "granted" && !message ? (
        <p className="inline-flex items-center gap-2 text-sm text-success">
          <CheckIcon /> Notificações ativas neste aparelho
        </p>
      ) : (
        support !== "granted" && (
          <Button
            variant={variant}
            icon={<BellIcon className="size-5" />}
            loading={pending}
            loadingLabel="Ativando…"
            block={false}
            onClick={enable}
          >
            {label}
          </Button>
        )
      )}
    </div>
  );
}
