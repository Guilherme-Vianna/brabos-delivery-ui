import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageLoading } from "@/components/app/page-loading";
import { JoinForm } from "@/components/courier/join-form";
import { describeInvite } from "@/lib/api/public";
import { LOGIN_PATH, NEXT_PARAM } from "@/lib/auth/constants";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Convite de entregador",
};

export default function InvitePage({ params }: PageProps<"/entregador/convite/[token]">) {
  return (
    <div className="mx-auto w-full max-w-md">
      <Suspense fallback={<PageLoading label="Abrindo convite…" />}>
        <InviteContent params={params} />
      </Suspense>
    </div>
  );
}

async function InviteContent({ params }: Pick<PageProps<"/entregador/convite/[token]">, "params">) {
  const { token } = await params;
  const invite = await describeInvite(token).catch(() => null);
  if (!invite) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-6">
        <h1 className="font-display text-3xl tracking-wide">Convite inválido</h1>
        <p className="mt-2 text-muted">Este link já foi usado ou expirou. Peça um novo para a loja.</p>
      </div>
    );
  }
  const user = await getSessionUser();
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6">
      <p className="text-sm text-accent uppercase">Convite de entregador</p>
      <h1 className="font-display text-4xl tracking-wide">Entregar para {invite.establishment_name}</h1>
      {user ? (
        <JoinForm token={token} defaultName={user.name ?? ""} />
      ) : (
        <>
          <p className="text-muted">Entre com sua conta (Google ou e-mail) para aceitar. Você só precisa fazer isso uma vez.</p>
          <Link
            href={`${LOGIN_PATH}?${NEXT_PARAM}=${encodeURIComponent(`/entregador/convite/${token}`)}`}
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 font-semibold text-on-primary"
          >
            Entrar para aceitar
          </Link>
        </>
      )}
    </div>
  );
}
