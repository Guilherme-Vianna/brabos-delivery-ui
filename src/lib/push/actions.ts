"use server";

import { requireSession, type ActionResult } from "@/lib/actions";
import { registerPushDevice } from "@/lib/api/owner";
import { registerCustomerPush } from "@/lib/api/public";
import { isDeviceToken } from "@/lib/customer/device";

const FAILED = "Não foi possível ativar as notificações agora. Tente de novo.";

export async function registerStaffPushAction(fcmToken: string, role: "owner" | "courier"): Promise<ActionResult> {
  await requireSession();
  try {
    await registerPushDevice(fcmToken, role);
  } catch {
    return { ok: false, error: FAILED };
  }
  return { ok: true, data: undefined };
}

export async function registerCustomerPushAction(device: string, fcmToken: string): Promise<ActionResult> {
  if (!isDeviceToken(device)) return { ok: false, error: FAILED };
  try {
    await registerCustomerPush(device, fcmToken);
  } catch {
    return { ok: false, error: FAILED };
  }
  return { ok: true, data: undefined };
}
