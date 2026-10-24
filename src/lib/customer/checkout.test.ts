import { describe, expect, it } from "vitest";
import { EMPTY_CHECKOUT, profileToRemember, rememberedProfile, validateCheckout } from "./checkout";

describe("checkout", () => {
  const filled = { ...EMPTY_CHECKOUT, fullName: "Ana", phone: "(11) 91234-5678", address: "Rua A, 10 - Centro" };

  it("requires name, phone and address", () => {
    expect(Object.keys(validateCheckout(EMPTY_CHECKOUT, 30))).toEqual(["fullName", "phone", "address"]);
    expect(validateCheckout(filled, 30)).toEqual({});
  });

  it("checks change only for cash", () => {
    expect(validateCheckout({ ...filled, payment: "cash", changeFor: "20" }, 30).changeFor).toBeDefined();
    expect(validateCheckout({ ...filled, payment: "cash", changeFor: "50" }, 30)).toEqual({});
    expect(validateCheckout({ ...filled, payment: "pix", changeFor: "20" }, 30)).toEqual({});
  });

  it("remembers only contact fields and survives bad data", () => {
    const stored = profileToRemember({ ...filled, notes: "sem cebola" });
    expect(rememberedProfile(stored)).toEqual({ fullName: "Ana", phone: "(11) 91234-5678", address: "Rua A, 10 - Centro", referencePoint: "" });
    expect(rememberedProfile("{oops")).toEqual({});
  });
});
