import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ApiError } from "@/lib/api/client";
import { getMyEstablishment } from "@/lib/api/owner";
import { listMyMemberships } from "@/lib/api/public";
import type { Establishment } from "@/lib/api/types";
import { COURIER_PATH, LOGIN_PATH, SIGNUP_PATH } from "./constants";
import { getSessionUser, type SessionUser } from "./session";

export type CurrentEstablishment =
  | { user: SessionUser; status: "ok"; establishment: Establishment }
  | { user: SessionUser; status: "missing" | "unavailable"; establishment: null };

export const loadCurrentEstablishment = cache(async (): Promise<CurrentEstablishment> => {
  const user = await getSessionUser();
  if (!user) redirect(LOGIN_PATH);
  try {
    return { user, status: "ok", establishment: await getMyEstablishment() };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect(LOGIN_PATH);
      if (error.status === 404) return { user, status: "missing", establishment: null };
    }
    return { user, status: "unavailable", establishment: null };
  }
});

export async function requireEstablishment(): Promise<Establishment | null> {
  const current = await loadCurrentEstablishment();
  if (current.status === "missing") {
    const memberships = await listMyMemberships().catch(() => []);
    redirect(memberships.length ? COURIER_PATH : SIGNUP_PATH);
  }
  return current.establishment;
}
