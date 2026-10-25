import { describe, expect, it } from "vitest";
import { firstPendingStep, isStepId } from "./steps";

describe("firstPendingStep", () => {
  it("starts with the menu when it is empty", () => {
    expect(firstPendingStep({ cardapio: false, horarios: false })).toBe("cardapio");
    expect(firstPendingStep({ cardapio: false, horarios: true })).toBe("cardapio");
  });

  it("moves to the hours once the menu has items", () => {
    expect(firstPendingStep({ cardapio: true, horarios: false })).toBe("horarios");
  });

  it("lands on sharing when everything is set", () => {
    expect(firstPendingStep({ cardapio: true, horarios: true })).toBe("divulgar");
  });
});

describe("isStepId", () => {
  it("accepts only known steps", () => {
    expect(isStepId("horarios")).toBe(true);
    expect(isStepId("outro")).toBe(false);
    expect(isStepId(undefined)).toBe(false);
  });
});
