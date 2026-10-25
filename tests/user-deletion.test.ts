import { describe, expect, it, vi, beforeEach } from "vitest";
import { normalizeEmail, isSameCanonicalEmail } from "@/lib/email-utils";

// Mock neon-auth/server
const mockGetSession = vi.fn();
vi.mock("@/lib/neon-auth/server", () => ({
  auth: {
    getSession: () => mockGetSession()
  }
}));

describe("Account Soft Deletion & Anti-Abuse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes Gmail aliases to protect against loop-hole re-registration", () => {
    const canonical = "johndoe@gmail.com";
    expect(normalizeEmail("john.doe@gmail.com")).toBe(canonical);
    expect(normalizeEmail("j.o.h.n.d.o.e@gmail.com")).toBe(canonical);
    expect(normalizeEmail("johndoe+trial1@gmail.com")).toBe(canonical);
    expect(normalizeEmail("john.doe+trial2@googlemail.com")).toBe(canonical);
    expect(isSameCanonicalEmail("john.doe@gmail.com", "johndoe+promo@googlemail.com")).toBe(true);
  });

  it("rejects unauthorized POST /api/user/delete when no session exists", async () => {
    mockGetSession.mockResolvedValue(null);

    const { POST } = await import("@/app/api/user/delete/route");
    const req = new Request("http://localhost:3000/api/user/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation: "delete me" })
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain("Unauthorized");
  });

  it("rejects POST /api/user/delete if confirmation text is not 'delete me'", async () => {
    mockGetSession.mockResolvedValue({
      data: {
        user: { id: "user_test_456", email: "test.user@gmail.com" }
      }
    });

    const { POST } = await import("@/app/api/user/delete/route");
    const req = new Request("http://localhost:3000/api/user/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation: "wrong text" })
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("delete me");
  });

  it("accepts valid 'delete me' confirmation and executes soft deletion", async () => {
    mockGetSession.mockResolvedValue({
      data: {
        user: { id: "user_test_789", email: "test.user+trial@gmail.com" }
      }
    });

    const { POST } = await import("@/app/api/user/delete/route");
    const req = new Request("http://localhost:3000/api/user/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation: "delete me" })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.normalizedEmail).toBe("testuser@gmail.com");
  });
});
