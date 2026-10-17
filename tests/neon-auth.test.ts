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
});
