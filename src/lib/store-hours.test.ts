import { describe, expect, it } from "vitest";
import { localClock, nextOpening } from "./store-hours";

describe("store hours", () => {
  const days = [
    { weekday: 4, opens_at: "18:00:00", closes_at: "23:30:00" },
    { weekday: 5, opens_at: "18:00:00", closes_at: "02:00:00" },
  ];

  it("describes the next opening", () => {
    expect(nextOpening(days, 4, 10 * 60)).toBe("Abre hoje às 18:00");
    expect(nextOpening(days, 4, 23 * 60)).toBe("Abre amanhã às 18:00");
    expect(nextOpening(days, 6, 12 * 60)).toBe("Abre sexta às 18:00");
    expect(nextOpening([], 0, 0)).toBeNull();
  });

  it("reads the local clock in the shop time zone", () => {
    expect(localClock(new Date("2026-10-23T15:30:00Z"), "America/Sao_Paulo")).toEqual({ weekday: 4, minute: 12 * 60 + 30 });
  });
});
