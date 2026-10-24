"use client";

import { useEffect } from "react";
import { pushSupport, registerServiceWorker, requestPushToken } from "@/lib/push/client";
import { registerStaffPushAction } from "@/lib/push/actions";

export function PushBridge({ role }: { role: "owner" | "courier" }) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const support = await pushSupport();
      if (support === "unsupported") return;
      await registerServiceWorker().catch(() => undefined);
      if (support !== "granted" || cancelled) return;
      const token = await requestPushToken().catch(() => null);
      if (token && !cancelled) await registerStaffPushAction(token, role);
    })();
    return () => {
      cancelled = true;
    };
  }, [role]);

  return null;
}
