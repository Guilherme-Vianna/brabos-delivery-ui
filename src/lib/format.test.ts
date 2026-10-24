import { describe, expect, it } from "vitest";
import { formatPrice, parsePrice } from "./money";
import { splitFullName } from "./people";
import { addDays, dayRange, formatTime, relativeDay, zonedIso } from "./time";

describe("money", () => {
  it("parses Brazilian prices", () => {
    expect(parsePrice("40")).toBe(40);
    expect(parsePrice("40,5")).toBe(40.5);
    expect(parsePrice("R$ 1.200,00")).toBe(1200);
    expect(parsePrice("12.5")).toBe(12.5);
    expect(parsePrice("abc")).toBeNull();
    expect(parsePrice("1,234")).toBeNull();
  });

  it("formats as BRL", () => {
    expect(formatPrice(45)).toBe("R$ 45,00");
  });
});

describe("people", () => {
  it("splits a single name field into first and last name", () => {
    expect(splitFullName("  João  da Silva ")).toEqual({ firstName: "João", lastName: "da Silva" });
    expect(splitFullName("Pedro")).toEqual({ firstName: "Pedro", lastName: "" });
  });
});

describe("time (America/Sao_Paulo)", () => {
  it("builds offset-aware ISO strings", () => {
    expect(zonedIso("2026-10-23", "09:30")).toBe("2026-10-23T09:30:00-03:00");
    expect(dayRange("2026-12-31")).toEqual({
      from: "2026-12-31T00:00:00-03:00",
      to: "2027-01-01T00:00:00-03:00",
    });
  });

  it("formats times in the shop time zone", () => {
    expect(formatTime("2026-10-23T12:00:00Z")).toBe("09:00");
  });

  it("names nearby days", () => {
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
    expect(relativeDay("2026-10-23", "2026-10-23")).toBe("Hoje");
    expect(relativeDay("2026-10-24", "2026-10-23")).toBe("Amanhã");
    expect(relativeDay("2026-10-25", "2026-10-23")).toBeNull();
  });
});
