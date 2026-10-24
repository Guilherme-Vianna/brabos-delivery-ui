import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { getFirebaseApp } from "@/lib/firebase/client";

export type PushSupport = "unsupported" | "unconfigured" | "default" | "granted" | "denied";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export async function pushSupport(): Promise<PushSupport> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("Notification" in window)) {
    return "unsupported";
  }
  if (!(await isSupported().catch(() => false))) return "unsupported";
  if (!VAPID_KEY || !process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) return "unconfigured";
  return Notification.permission;
}

export function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register("/sw.js");
}

export async function requestPushToken(): Promise<string | null> {
  if ((await pushSupport()) === "unsupported" || !VAPID_KEY) return null;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;
  const registration = await registerServiceWorker();
  return getToken(getMessaging(getFirebaseApp()), { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
}

export function onPushMessage(handler: (data: Record<string, string>) => void): () => void {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return () => undefined;
  const listener = (event: MessageEvent) => {
    if (event.data?.type === "push") handler(event.data.data ?? {});
  };
  navigator.serviceWorker.addEventListener("message", listener);
  return () => navigator.serviceWorker.removeEventListener("message", listener);
}

export function playChime() {
  try {
    const context = new AudioContext();
    const start = context.currentTime;
    for (const [offset, frequency] of [
      [0, 880],
      [0.18, 1175],
      [0.36, 1568],
    ]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start + offset);
      gain.gain.exponentialRampToValueAtTime(0.25, start + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.25);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start + offset);
      oscillator.stop(start + offset + 0.3);
    }
  } catch {}
}
