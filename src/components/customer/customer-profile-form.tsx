"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { saveCustomerProfileAction } from "@/lib/customer/profile-actions";
import { maskPhone } from "@/lib/establishment/validation";

type Values = { fullName: string; phone: string; address: string; referencePoint: string };

export function CustomerProfileForm({ initial }: { initial: Values }) {
  const [values, setValues] = useState(initial);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function update(field: keyof Values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setMessage(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveCustomerProfileAction(values);
      setMessage(result.ok ? { tone: "success", text: "Dados salvos. Eles já vêm preenchidos no próximo pedido." } : { tone: "error", text: result.error });
    });
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <TextField label="Nome" autoComplete="name" value={values.fullName} disabled={pending} onChange={(e) => update("fullName", e.target.value)} />
      <TextField
        label="Telefone / WhatsApp"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={values.phone}
        disabled={pending}
        onChange={(e) => update("phone", maskPhone(e.target.value))}
      />
      <TextField label="Endereço de entrega" optional autoComplete="street-address" value={values.address} disabled={pending} onChange={(e) => update("address", e.target.value)} />
      <TextField label="Ponto de referência" optional value={values.referencePoint} disabled={pending} onChange={(e) => update("referencePoint", e.target.value)} />
      <Button type="submit" className="sm:w-auto sm:self-start" loading={pending} loadingLabel="Salvando…">
        Salvar meus dados
      </Button>
    </form>
  );
}
