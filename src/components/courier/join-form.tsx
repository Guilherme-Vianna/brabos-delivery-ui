"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { joinAsCourierAction } from "@/lib/courier/actions";
import { maskPhone } from "@/lib/establishment/validation";

export function JoinForm({ token, defaultName }: { token: string; defaultName: string }) {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await joinAsCourierAction(token, name, phone);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      {error && <Alert tone="error">{error}</Alert>}
      <TextField label="Seu nome" autoComplete="name" value={name} disabled={pending} onChange={(event) => setName(event.target.value)} />
      <TextField
        label="Celular"
        optional
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="(11) 98888-7777"
        value={phone}
        disabled={pending}
        onChange={(event) => setPhone(maskPhone(event.target.value))}
      />
      <Button type="submit" loading={pending} loadingLabel="Entrando…">
        Aceitar convite
      </Button>
    </form>
  );
}
