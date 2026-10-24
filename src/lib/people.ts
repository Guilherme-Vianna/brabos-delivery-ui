export const MAX_FIRST_NAME = 100;
export const MAX_LAST_NAME = 150;
export const MAX_BARBERSHOP_NAME = 150;

export function splitFullName(value: string | null | undefined): { firstName: string; lastName: string } {
  const parts = (value ?? "").trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export function personName(firstName: string, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ");
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}
