import "server-only";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { SESSION_EXPIRED_PATH, SIGNUP_PATH } from "@/lib/auth/constants";
import { getSessionUser } from "@/lib/auth/session";

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

export const UNAVAILABLE = "Não foi possível salvar agora. Seus dados continuam aqui; tente de novo em instantes.";

export async function requireSession() {
  if (!(await getSessionUser())) redirect(SESSION_EXPIRED_PATH);
}

export function handleCommonErrors(error: unknown) {
  if (!(error instanceof ApiError)) return;
  if (error.status === 401) redirect(SESSION_EXPIRED_PATH);
  if (error.status === 403) redirect(SIGNUP_PATH);
}

export function apiStatus(error: unknown): number {
  return error instanceof ApiError ? error.status : 0;
}

export function apiDetail(error: unknown): string {
  return error instanceof ApiError && typeof error.detail === "string" ? error.detail : "";
}
