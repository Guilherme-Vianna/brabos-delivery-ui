import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/api/types";
import { addLine, buildLine, cartTotals, lineLabel, setQuantity, syncWithMenu, toOrderItems } from "./cart";

function product(id: string, price: number, extra: Partial<Product> = {}): Product {
  return {
    id,
    name: id,
    description: "",
    ingredients: "",
    category: "",
    price,
    allows_half: true,
    asks_doneness: false,
    position: 0,
    image_url: null,
    ...extra,
  };
}

describe("cart", () => {
  const bacon = product("bacon", 35, { asks_doneness: true });
  const salad = product("salad", 28);

  it("charges the most expensive half and keeps doneness only when asked", () => {
    const half = buildLine(salad, bacon, 2, "medium", " sem cebola ");
    expect(half.unitPrice).toBe(35);
    expect(half.doneness).toBe("medium");
    expect(lineLabel(half)).toBe("½ salad + ½ bacon");
    expect(buildLine(salad, null, 1, "rare", "").doneness).toBeNull();
  });

  it("merges identical lines regardless of half order", () => {
    const lines = addLine([buildLine(bacon, salad, 1, "rare", "")], buildLine(salad, bacon, 2, "rare", ""));
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(3);
  });

  it("updates quantities and totals", () => {
    let lines = [buildLine(salad, null, 2, null, ""), buildLine(bacon, null, 1, "well_done", "")];
    lines = setQuantity(lines, lines[1].key, 0);
    expect(cartTotals(lines, { enabled: true, value: 5.5 })).toEqual({
      subtotal: 56,
      deliveryFee: 5.5,
      total: 61.5,
      count: 2,
    });
    expect(cartTotals(lines, { enabled: false, value: 5.5 }).total).toBe(56);
  });

  it("drops products that left the menu and refreshes prices", () => {
    const lines = [buildLine(salad, bacon, 1, "rare", ""), buildLine(salad, null, 1, null, "")];
    const synced = syncWithMenu(lines, [product("salad", 30)]);
    expect(synced).toHaveLength(1);
    expect(synced[0].unitPrice).toBe(30);
    expect(toOrderItems(synced)[0]).toEqual({
      product_id: "salad",
      half_product_id: null,
      quantity: 1,
      doneness: null,
      notes: null,
    });
  });
});
