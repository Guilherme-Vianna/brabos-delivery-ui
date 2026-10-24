import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { PageLoading } from "@/components/app/page-loading";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ProfileForm } from "@/components/establishment/profile-form";
import { HOME_PATH } from "@/lib/auth/constants";
import { loadCurrentEstablishment } from "@/lib/auth/current-establishment";

export const metadata: Metadata = {
  title: "Cadastrar estabelecimento",
};

export default function SignupPage() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <PageHeader
        eyebrow="Primeiro passo"
        title="Cadastre sua loja"
        description="Leva menos de um minuto. Depois você monta o cardápio e define os horários."
      />
      <Suspense fallback={<PageLoading label="Carregando…" />}>
        <SignupContent />
      </Suspense>
    </div>
  );
}

async function SignupContent() {
  const current = await loadCurrentEstablishment();
  if (current.status === "ok") redirect(HOME_PATH);
  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
        <ProfileForm mode="register" />
      </div>
      <div className="flex items-center justify-between gap-4 text-sm text-muted">
        <span>Entrou com a conta errada?</span>
        <SignOutButton />
      </div>
    </div>
  );
}
