import { describe, expect, it } from "vitest";
import { isValidCnpj, maskCnpj, maskPhone, validateProfile } from "./validation";

describe("establishment validation", () => {
  it("checks CNPJ digits like the API", () => {
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
    expect(isValidCnpj("11222333000180")).toBe(false);
    expect(isValidCnpj("11111111111111")).toBe(false);
  });

  it("masks phone and CNPJ while typing", () => {
    expect(maskPhone("11988887777")).toBe("(11) 98888-7777");
    expect(maskPhone("1133334444")).toBe("(11) 3333-4444");
    expect(maskCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("validates the profile form", () => {
    expect(validateProfile({ name: "", phone: "11", address: "Rua", cnpj: "123", slug: "A" })).toEqual({
      name: expect.any(String),
      phone: expect.any(String),
      address: expect.any(String),
      cnpj: expect.any(String),
      slug: expect.any(String),
    });
    expect(validateProfile({ name: "Brabos", phone: "11988887777", address: "Rua A, 10", cnpj: "" })).toEqual({});
  });
});
