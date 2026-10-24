import { describe, expect, it } from "vitest";
import { awaitingPayment, boardColumn, changeDue, elapsedLabel, formatPhone, minutesSince } from "./orders";

describe("orders", () => {
  it("maps statuses to board columns", () => {
    expect(boardColumn({ status: "placed" })).toBe("new");
    expect(boardColumn({ status: "accepted" })).toBe("active");
    expect(boardColumn({ status: "cancelled" })).toBe("done");
  });

  it("computes change for cash orders only", () => {
    expect(changeDue({ payment_method: "cash", change_for: 100, total: 81.5 })).toBe(18.5);
    expect(changeDue({ payment_method: "pix", change_for: null, total: 10 })).toBeNull();
  });

  it("flags online orders waiting for payment", () => {
    expect(awaitingPayment({ payment_method: "online", payment_status: "pending" })).toBe(true);
    expect(awaitingPayment({ payment_method: "online", payment_status: "paid" })).toBe(false);
  });

  it("formats elapsed time and phones", () => {
    const now = Date.parse("2026-10-24T12:00:00Z");
    expect(minutesSince("2026-10-24T11:15:00Z", now)).toBe(45);
    expect(elapsedLabel(0)).toBe("agora");
    expect(elapsedLabel(45)).toBe("há 45 min");
    expect(elapsedLabel(125)).toBe("há 2h05");
    expect(formatPhone("11988887777")).toBe("(11) 98888-7777");
  });
});
