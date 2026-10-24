import { describe, expect, it } from "vitest";
import { buttonContrast, contrastRatio, mix, readableText, storeTheme } from "./color";

describe("color", () => {
  it("computes WCAG contrast", () => {
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 0);
    expect(contrastRatio("#D62828", "#FFFFFF")).toBeGreaterThan(4.5);
  });

  it("picks readable text for a background", () => {
    expect(readableText("#D62828")).toBe("#FFFFFF");
    expect(readableText("#E9C46A")).toBe("#121212");
    expect(buttonContrast("#E9C46A")).toBeGreaterThan(4.5);
  });

  it("mixes colors", () => {
    expect(mix("#000000", "#FFFFFF", 0.5)).toBe("#808080");
  });

  it("builds store theme variables with a safe fallback", () => {
    const theme = storeTheme("nope", "#FFB703") as Record<string, string>;
    expect(theme["--color-primary"]).toBe("#D62828");
    expect(theme["--color-on-primary"]).toBe("#FFFFFF");
  });
});
