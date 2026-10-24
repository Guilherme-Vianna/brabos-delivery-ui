"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { registerEstablishmentAction, updateProfileAction } from "@/lib/establishment/actions";
import {
  maskCnpj,
  maskPhone,
  validateProfile,
  type ProfileErrors,
  type ProfileValues,
} from "@/lib/establishment/validation";

type ProfileFormProps = {
  mode: "register" | "edit";
  initial?: ProfileValues;
};

export function ProfileForm({ mode, initial }: ProfileFormProps) {
  const [values, setValues] = useState<ProfileValues>(
    initial ?? { name: "", phone: "", address: "", cnpj: "" },
  );
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const cnpjRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);

  function update(field: keyof ProfileValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setSaved(false);
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const found = validateProfile(values);
    setErrors(found);
    const first = (Object.keys(found) as (keyof ProfileValues)[])[0];
    if (first) {
      const refs = { name: nameRef, phone: phoneRef, address: addressRef, cnpj: cnpjRef, slug: slugRef };
      refs[first].current?.focus();
      return;
    }
    startTransition(async () => {
      const result = mode === "register" ? await registerEstablishmentAction(values) : await updateProfileAction(values);
      if (result.ok) {
        setSaved(true);
        return;
      }
      setErrors(result.fieldErrors);
      setFormError(result.formError);
    });
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      {formError && <Alert tone="error">{formError}</Alert>}
      {saved && <Alert tone="success">Dados salvos.</Alert>}
      <TextField
        ref={nameRef}
        label="Nome do estabelecimento"
        autoComplete="organization"
        placeholder="Ex.: Brabos Burguer"
        value={values.name}
        error={errors.name}
        disabled={pending}
        onChange={(event) => update("name", event.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          ref={phoneRef}
          label="Telefone / WhatsApp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(11) 98888-7777"
          value={values.phone}
          error={errors.phone}
          disabled={pending}
          onChange={(event) => update("phone", maskPhone(event.target.value))}
        />
        <TextField
          ref={cnpjRef}
          label="CNPJ"
          optional
          inputMode="numeric"
          placeholder="00.000.000/0000-00"
          value={values.cnpj}
          error={errors.cnpj}
          disabled={pending}
          onChange={(event) => update("cnpj", maskCnpj(event.target.value))}
        />
      </div>
      <TextField
        ref={addressRef}
        label="Endereço"
        autoComplete="street-address"
        placeholder="Rua, número, bairro e cidade"
        value={values.address}
        error={errors.address}
        disabled={pending}
        onChange={(event) => update("address", event.target.value)}
      />
      {values.slug !== undefined && (
        <TextField
          ref={slugRef}
          label="Link do cardápio"
          autoCapitalize="none"
          spellCheck={false}
          hint="Seus clientes acessam /e/ + este nome. Mudar invalida o link antigo."
          value={values.slug}
          error={errors.slug}
          disabled={pending}
          onChange={(event) => update("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
        />
      )}
      <Button
        type="submit"
        className="mt-1 sm:w-auto sm:self-start"
        loading={pending}
        loadingLabel={mode === "register" ? "Criando sua loja…" : "Salvando…"}
      >
        {mode === "register" ? "Criar minha loja" : "Salvar dados"}
      </Button>
    </form>
  );
}
