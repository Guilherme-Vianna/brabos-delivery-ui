"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { apiStatus, requireSession, type ActionResult } from "@/lib/actions";
import { acceptInvite, deliverAsCourier } from "@/lib/api/public";
import { COURIER_PATH, LOGIN_PATH } from "@/lib/auth/constants";
import { digits, validatePhone } from "@/lib/establishment/validation";

export async function joinAsCourierAction(token: string, name: string, phone: string): Promise<ActionResult> {
  await requireSession();
  if (name.trim().length < 2) return { ok: false, error: "Digite seu nome." };
  if (phone.trim() && validatePhone(phone)) return { ok: false, error: "Telefone inválido. Use DDD + número ou deixe vazio." };
  try {
    await acceptInvite(token, { name: name.trim(), phone: phone.trim() ? digits(phone) : null });
  } catch (error) {
    const status = apiStatus(error);
    if (status === 401) redirect(LOGIN_PATH);
    if (status === 404) return { ok: false, error: "Este convite já foi usado ou expirou. Peça um novo link para a loja." };
    if (status === 409) return { ok: false, error: "Você é o dono desta loja; entregadores precisam usar outra conta." };
    return { ok: false, error: "Não foi possível entrar agora. Tente de novo." };
  }
  redirect(COURIER_PATH);
}

export async function courierDeliverAction(orderId: string): Promise<ActionResult> {
  await requireSession();
  try {
    await deliverAsCourier(orderId);
  } catch (error) {
    refresh();
    if (apiStatus(error) === 409) return { ok: false, error: "Este pedido já foi entregue ou cancelado." };
    return { ok: false, error: "Não foi possível confirmar agora. Tente de novo." };
  }
  refresh();
  return { ok: true, data: undefined };
}
