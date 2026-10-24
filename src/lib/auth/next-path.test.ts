import { describe, expect, it } from "vitest";
import { safeNextPath } from "./next-path";

describe("safeNextPath", () => {
  it("accepts internal protected paths", () => {
    expect(safeNextPath("/produtos")).toBe("/produtos");
    expect(safeNextPath("/e/brabos-burguer?carrinho=1")).toBe("/e/brabos-burguer?carrinho=1");
    expect(safeNextPath("/entregador/convite/abc")).toBe("/entregador/convite/abc");
  });

  it("rejects external, protocol-relative and unknown paths", () => {
    expect(safeNextPath("https://evil.com")).toBeNull();
    expect(safeNextPath("//evil.com/pedidos")).toBeNull();
    expect(safeNextPath("/\\evil.com")).toBeNull();
    expect(safeNextPath("/api/session")).toBeNull();
    expect(safeNextPath(null)).toBeNull();
  });
});
