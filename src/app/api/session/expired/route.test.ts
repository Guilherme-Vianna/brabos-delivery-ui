// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

const cookieStore = { delete: vi.fn() };

vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));

const { GET } = await import("./route");

describe("/api/session/expired", () => {
  it("clears the rejected session cookie before sending the user to login", async () => {
    const response = await GET(new Request("http://localhost/api/session/expired"));

    expect(cookieStore.delete).toHaveBeenCalledWith("session");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/?sessao-expirada=1");
  });
});
