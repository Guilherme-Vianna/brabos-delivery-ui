const DEVICE_KEY = "brabos:device";
const VALID = /^[A-Za-z0-9_-]{32,128}$/;

let fallback: string | null = null;

function generate(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

export function isDeviceToken(value: unknown): value is string {
  return typeof value === "string" && VALID.test(value);
}

export function deviceToken(): string {
  try {
    const stored = window.localStorage.getItem(DEVICE_KEY);
    if (isDeviceToken(stored)) return stored;
    const created = generate();
    window.localStorage.setItem(DEVICE_KEY, created);
    return created;
  } catch {
    fallback ??= generate();
    return fallback;
  }
}
