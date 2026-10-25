import { describe, expect, it } from "vitest";
import { normalizeEmail, isSameCanonicalEmail } from "@/lib/email-utils";

describe("Email Normalization & Anti-Abuse", () => {
  it("normalizes standard gmail addresses by lowercasing", () => {
    expect(normalizeEmail("TestUser@gmail.com")).toBe("testuser@gmail.com");
  });

  it("strips dots from Gmail addresses to defeat the Gmail dot loophole", () => {
    expect(normalizeEmail("t.e.s.t.u.s.e.r@gmail.com")).toBe("testuser@gmail.com");
    expect(normalizeEmail("john.doe@gmail.com")).toBe("johndoe@gmail.com");
  });

  it("strips plus-addressing from Gmail addresses to defeat alias recreation", () => {
    expect(normalizeEmail("testuser+freetrial1@gmail.com")).toBe("testuser@gmail.com");
    expect(normalizeEmail("john.doe+trial2@gmail.com")).toBe("johndoe@gmail.com");
  });

  it("normalizes googlemail.com to gmail.com", () => {
    expect(normalizeEmail("user.name+promo@googlemail.com")).toBe("username@gmail.com");
  });

  it("identifies matching canonical addresses across alias variants", () => {
    const raw = "alice.bob@gmail.com";
    const variant1 = "alicebob+trial@gmail.com";
    const variant2 = "a.l.i.c.e.b.o.b@gmail.com";

    expect(isSameCanonicalEmail(raw, variant1)).toBe(true);
    expect(isSameCanonicalEmail(raw, variant2)).toBe(true);
    expect(isSameCanonicalEmail(raw, "charlie@gmail.com")).toBe(false);
  });
});
