"use server";

import { refresh } from "next/cache";
import { requireSession, type ActionResult } from "@/lib/actions";
import { saveCustomerProfile } from "@/lib/api/public";
import { digits, validatePhone } from "@/lib/establishment/validation";

export async function saveCustomerProfileAction(values: {
  fullName: string;
  phone: string;
  address: string;
  referencePoint: string;
}): Promise<ActionResult> {
  await requireSession();
  if (values.fullName.trim().length < 2) return { ok: false, error: "Digite seu nome." };
  if (validatePhone(values.phone)) return { ok: false, error: "Digite o telefone com DDD." };
  if (values.address.trim() && values.address.trim().length < 5) return { ok: false, error: "Endereço muito curto." };
  try {
    await saveCustomerProfile({
      full_name: values.fullName.trim(),
      phone: digits(values.phone),
      address: values.address.trim() || null,
      reference_point: values.referencePoint.trim() || null,
    });
  } catch {
    return { ok: false, error: "Não foi possível salvar agora. Tente de novo." };
  }
  refresh();
  return { ok: true, data: undefined };
}
