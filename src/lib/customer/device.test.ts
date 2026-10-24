import { beforeEach, describe, expect, it } from "vitest";
import { deviceToken, isDeviceToken } from "./device";

describe("deviceToken", () => {
  beforeEach(() => window.localStorage.clear());

  it("creates a random token once and keeps it", () => {
    const first = deviceToken();
    expect(isDeviceToken(first)).toBe(true);
    expect(deviceToken()).toBe(first);
  });

  it("replaces an invalid stored value", () => {
    window.localStorage.setItem("navalha:device", "short");
    expect(isDeviceToken(deviceToken())).toBe(true);
  });
});
