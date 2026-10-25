import { describe, expect, it } from "vitest";
import { auth, neonAuth } from "@/lib/neon-auth/server";
import { authClient, neonAuthClient } from "@/lib/neon-auth/client";
import { authViewPaths, accountViewPaths } from "@neondatabase/auth-ui/server";
import { createPaste, getUserPastes, deleteUserPaste, consumePaste } from "@/lib/paste-service";

describe("Neon Auth Integration", () => {
  it("initializes server instance with handler, middleware, and getSession", () => {
    expect(auth).toBeDefined();
    expect(neonAuth).toBe(auth);
    expect(typeof auth.handler).toBe("function");
    expect(typeof auth.middleware).toBe("function");
    expect(typeof auth.getSession).toBe("function");
  });

  it("initializes client instance with auth methods", () => {
    expect(authClient).toBeDefined();
    expect(neonAuthClient).toBe(authClient);
    expect(typeof authClient.signIn).toBe("function");
    expect(typeof authClient.signUp).toBe("function");
    expect(typeof authClient.signOut).toBe("function");
    expect(typeof authClient.useSession).toBe("function");
  });

  it("exports valid authViewPaths and accountViewPaths for routing", () => {
    expect(authViewPaths.SIGN_IN).toBe("sign-in");
    expect(authViewPaths.SIGN_UP).toBe("sign-up");
    expect(authViewPaths.EMAIL_OTP).toBe("email-otp");
    expect(authViewPaths.CALLBACK).toBe("callback");
    expect(accountViewPaths.SECURITY).toBe("security");
  });

  it("handles anonymous paste creation without user_id", async () => {
    const paste = await createPaste({
      title: "Anonymous Test Paste",
      content: "console.log('hello anonymous');",
      language: "typescript",
      ttl_seconds: 3600
    });

    expect(paste.id).toBeDefined();
    expect(paste.userId).toBeNull();

    const fetched = await consumePaste(paste.id);
    expect(fetched.content).toBe("console.log('hello anonymous');");
    expect(fetched.viewsCount).toBe(1);
  });

  it("associates pastes with authenticated Neon Auth user ID and enforces isolation", async () => {
    const userA_Id = `neon_usr_test_${Date.now()}_A`;
    const userB_Id = `neon_usr_test_${Date.now()}_B`;

    // Create paste owned by User A
    const pasteA = await createPaste(
      {
        title: "User A Secret Paste",
        content: "User A content",
        language: "javascript",
        ttl_seconds: 3600
      },
      userA_Id
    );

    expect(pasteA.userId).toBe(userA_Id);

    // Create paste owned by User B
    const pasteB = await createPaste(
      {
        title: "User B Secret Paste",
        content: "User B content",
        language: "python",
        ttl_seconds: 3600
      },
      userB_Id
    );

    expect(pasteB.userId).toBe(userB_Id);

    // User A can list User A's pastes
    const userAPastes = await getUserPastes(userA_Id);
    expect(userAPastes.some((p) => p.id === pasteA.id)).toBe(true);
    expect(userAPastes.some((p) => p.id === pasteB.id)).toBe(false);

    // User B cannot delete User A's paste
    const unauthorizedDelete = await deleteUserPaste(pasteA.id, userB_Id);
    expect(unauthorizedDelete).toBe(false);

    // User A can delete their own paste
    const authorizedDelete = await deleteUserPaste(pasteA.id, userA_Id);
    expect(authorizedDelete).toBe(true);

    // Cleanup User B's paste
    await deleteUserPaste(pasteB.id, userB_Id);
  });

  it("clears authentication cookies on POST /api/auth/logout with Secure flag on __Secure- cookies", async () => {
    const { POST, KNOWN_AUTH_COOKIES } = await import("@/app/api/auth/logout/route");
    expect(KNOWN_AUTH_COOKIES).toContain("__Secure-neon-auth.state");
    expect(KNOWN_AUTH_COOKIES).toContain("__Secure-neon-auth.pkce_code_verifier");

    const res = await POST();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);

    const setCookies = res.headers.getSetCookie();
    expect(setCookies.length).toBeGreaterThan(0);

    const sessionTokenCookie = setCookies.find((c) => c.includes("__Secure-neon-auth.session_token"));
    expect(sessionTokenCookie).toBeDefined();
    expect(sessionTokenCookie).toContain("Max-Age=0");
    expect(sessionTokenCookie).toContain("Secure");

    const localDataCookie = setCookies.find((c) => c.includes("__Secure-neon-auth.local.session_data"));
    expect(localDataCookie).toBeDefined();
    expect(localDataCookie).toContain("Max-Age=0");
    expect(localDataCookie).toContain("Secure");
  });

  it("resolves canonical origins via getAppOrigin helper", async () => {
    const { getAppOrigin } = await import("@/lib/api");
    const req = new Request("https://preview-123.vercel.app/api/pastes", {
      headers: { host: "custom.domain.com", "x-forwarded-proto": "https" }
    });
    expect(getAppOrigin(req)).toBe("https://custom.domain.com");
  });

  it("allows public paste routes through proxy without login redirect", async () => {
    const { proxy } = await import("@/proxy");
    const { NextRequest } = await import("next/server");
    const req = new NextRequest("http://localhost:3000/p/ANwt7yq7BgCa");
    const res = await proxy(req);
    expect(res.status).toBe(200);
  });

  it("redirects unauthenticated access to /my-pastes through proxy", async () => {
    const { proxy } = await import("@/proxy");
    const { NextRequest } = await import("next/server");
    const req = new NextRequest("http://localhost:3000/my-pastes");
    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth/sign-in");
  });
});
