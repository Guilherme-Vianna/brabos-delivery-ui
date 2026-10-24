"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { apiDetail, apiStatus, handleCommonErrors, requireSession, UNAVAILABLE, type ActionResult } from "@/lib/actions";
import {
  createAbsence,
  createCourierInvite,
  deleteAbsence,
  deleteEstablishment,
  registerEstablishment,
  replaceOpeningHours,
  setCourierActive,
  updateEstablishment,
  type EstablishmentInput,
} from "@/lib/api/owner";
import type { CourierInvite, OpeningDay } from "@/lib/api/types";
import { HOME_PATH, LOGIN_PATH, SESSION_EXPIRED_PATH } from "@/lib/auth/constants";
import { digits, validateProfile, type ProfileErrors, type ProfileValues } from "./validation";

export type ProfileResult = { ok: true } | { ok: false; fieldErrors: ProfileErrors; formError: string | null };

function profilePayload(values: ProfileValues): EstablishmentInput {
  return {
    name: values.name.trim(),
    phone: digits(values.phone),
    address: values.address.trim(),
    cnpj: values.cnpj.trim() ? digits(values.cnpj) : null,
    ...(values.slug !== undefined ? { slug: values.slug.trim().toLowerCase() } : {}),
  };
}

export async function registerEstablishmentAction(values: ProfileValues): Promise<ProfileResult> {
  await requireSession();
  const fieldErrors = validateProfile(values);
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors, formError: null };
  try {
    await registerEstablishment(profilePayload(values));
  } catch (error) {
    if (apiStatus(error) === 401) redirect(SESSION_EXPIRED_PATH);
    if (apiStatus(error) === 409) redirect(HOME_PATH);
    return { ok: false, fieldErrors: {}, formError: UNAVAILABLE };
  }
  redirect(`${HOME_PATH}?bem-vindo=1`);
}

export async function updateProfileAction(values: ProfileValues): Promise<ProfileResult> {
  await requireSession();
  const fieldErrors = validateProfile(values);
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors, formError: null };
  try {
    await updateEstablishment(profilePayload(values));
  } catch (error) {
    handleCommonErrors(error);
    if (apiStatus(error) === 409) {
      return { ok: false, fieldErrors: { slug: "Este link já está em uso por outra loja. Escolha outro." }, formError: null };
    }
    return { ok: false, fieldErrors: {}, formError: UNAVAILABLE };
  }
  refresh();
  return { ok: true };
}

export async function updateSettingsAction(changes: EstablishmentInput): Promise<ActionResult> {
  await requireSession();
  try {
    await updateEstablishment(changes);
  } catch (error) {
    handleCommonErrors(error);
    if (apiStatus(error) === 422 && apiDetail(error).includes("Online payments")) {
      return { ok: false, error: "O pagamento online ainda não foi configurado no servidor (Stripe)." };
    }
    return { ok: false, error: UNAVAILABLE };
  }
  refresh();
  return { ok: true, data: undefined };
}

export async function saveHoursAction(days: OpeningDay[]): Promise<ActionResult> {
  await requireSession();
  try {
    await replaceOpeningHours(days);
  } catch (error) {
    handleCommonErrors(error);
    return { ok: false, error: UNAVAILABLE };
  }
  refresh();
  return { ok: true, data: undefined };
}

export async function createAbsenceAction(startsAt: string, endsAt: string, reason: string): Promise<ActionResult> {
  await requireSession();
  if (Date.parse(endsAt) <= Date.parse(startsAt)) return { ok: false, error: "O fim precisa ser depois do início." };
  try {
    await createAbsence({ starts_at: startsAt, ends_at: endsAt, reason: reason.trim() || null });
  } catch (error) {
    handleCommonErrors(error);
    return { ok: false, error: UNAVAILABLE };
  }
  refresh();
  return { ok: true, data: undefined };
}

export async function deleteAbsenceAction(absenceId: string): Promise<ActionResult> {
  await requireSession();
  try {
    await deleteAbsence(absenceId);
  } catch (error) {
    handleCommonErrors(error);
    if (apiStatus(error) !== 404) return { ok: false, error: UNAVAILABLE };
  }
  refresh();
  return { ok: true, data: undefined };
}

export async function createInviteAction(): Promise<ActionResult<CourierInvite>> {
  await requireSession();
  try {
    return { ok: true, data: await createCourierInvite() };
  } catch (error) {
    handleCommonErrors(error);
    return { ok: false, error: "Não foi possível gerar o convite agora. Tente de novo." };
  }
}

export async function setCourierActiveAction(courierId: string, active: boolean): Promise<ActionResult> {
  await requireSession();
  try {
    await setCourierActive(courierId, active);
  } catch (error) {
    handleCommonErrors(error);
    return { ok: false, error: "Não foi possível mudar agora. Tente de novo." };
  }
  refresh();
  return { ok: true, data: undefined };
}

export async function deleteEstablishmentAction(): Promise<ActionResult> {
  await requireSession();
  try {
    await deleteEstablishment();
  } catch (error) {
    handleCommonErrors(error);
    return { ok: false, error: "Não foi possível excluir agora. Tente de novo em instantes." };
  }
  redirect(LOGIN_PATH);
}
