export const TIME_ZONE = process.env.NEXT_PUBLIC_TIME_ZONE || "America/Sao_Paulo";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const keyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const timeFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit" });
const offsetFormatter = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "longOffset" });

export function isDateKey(value: unknown): value is string {
  return typeof value === "string" && DATE_KEY.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function isTime(value: unknown): value is string {
  return typeof value === "string" && TIME.test(value);
}

export function dateKey(instant: Date | string): string {
  return keyFormatter.format(typeof instant === "string" ? new Date(instant) : instant);
}

export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function offsetAt(instant: Date): string {
  const label = offsetFormatter.formatToParts(instant).find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = /GMT([+-]\d{2}):?(\d{2})?/.exec(label);
  return match ? `${match[1]}:${match[2] ?? "00"}` : "+00:00";
}

export function zonedIso(date: string, time: string): string {
  const firstGuess = offsetAt(new Date(`${date}T${time}:00Z`));
  const offset = offsetAt(new Date(`${date}T${time}:00${firstGuess}`));
  return `${date}T${time}:00${offset}`;
}

export function dayRange(date: string) {
  return { from: zonedIso(date, "00:00"), to: zonedIso(addDays(date, 1), "00:00") };
}

export function formatTime(instant: string | Date): string {
  return timeFormatter.format(typeof instant === "string" ? new Date(instant) : instant);
}

export function minutesBetween(start: string, end: string): number {
  return Math.round((Date.parse(end) - Date.parse(start)) / 60000);
}

function calendarDate(date: string) {
  return new Date(`${date}T12:00:00Z`);
}

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", weekday: "short" });
const longFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });
const shortFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });

export function weekdayShort(date: string): string {
  return weekdayFormatter.format(calendarDate(date)).replace(".", "");
}

export function dayOfMonth(date: string): number {
  return Number(date.slice(8, 10));
}

export function relativeDay(date: string, today: string): string | null {
  if (date === today) return "Hoje";
  if (date === addDays(today, 1)) return "Amanhã";
  return null;
}

export function formatLongDate(date: string): string {
  const text = longFormatter.format(calendarDate(date));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatShortDate(date: string): string {
  return shortFormatter.format(calendarDate(date)).replaceAll(".", "");
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
