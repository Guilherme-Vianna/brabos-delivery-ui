import type { OpeningDay } from "@/lib/api/types";

const WEEKDAY_NAMES = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];

export function nextOpening(days: OpeningDay[], weekday: number, minuteOfDay: number): string | null {
  for (let offset = 0; offset < 8; offset += 1) {
    const day = days.find((item) => item.weekday === (weekday + offset) % 7);
    if (!day) continue;
    const [hours, minutes] = day.opens_at.split(":").map(Number);
    if (offset === 0 && hours * 60 + minutes <= minuteOfDay) continue;
    const time = day.opens_at.slice(0, 5);
    if (offset === 0) return `Abre hoje às ${time}`;
    if (offset === 1) return `Abre amanhã às ${time}`;
    return `Abre ${WEEKDAY_NAMES[(weekday + offset) % 7]} às ${time}`;
  }
  return null;
}

export function localClock(now: Date, timeZone: string): { weekday: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday"));
  return { weekday, minute: Number(get("hour")) * 60 + Number(get("minute")) };
}
