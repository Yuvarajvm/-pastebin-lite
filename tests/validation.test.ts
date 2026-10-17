import { describe, expect, it } from "vitest";
import { MAX_CONTENT_BYTES, createPasteSchema } from "@/lib/validation";

describe("createPasteSchema", () => {
  it("accepts a paste without limits", () => {
    const result = createPasteSchema.parse({ content: "hello" });
    expect(result.title).toBe("Untitled");
    expect(result.language).toBe("text");
  });
  it("accepts supported languages and rejects unsupported ones", () => {
    expect(createPasteSchema.safeParse({ content: "const x = 1", language: "typescript", title: "Example" }).success).toBe(true);
    expect(createPasteSchema.safeParse({ content: "hi", language: "ruby" }).success).toBe(false);
    expect(createPasteSchema.safeParse({ content: "hi", title: "x".repeat(121) }).success).toBe(false);
  });
  it("rejects empty content and invalid limits", () => {
    for (const value of [0, -1, 1.5, 1_000_001]) {
      expect(createPasteSchema.safeParse({ content: "text", max_views: value }).success).toBe(false);
    }
    expect(createPasteSchema.safeParse({ content: "" }).success).toBe(false);
  });
  it("measures content in UTF-8 bytes", () => {
    expect(createPasteSchema.safeParse({ content: "a".repeat(MAX_CONTENT_BYTES) }).success).toBe(true);
    expect(createPasteSchema.safeParse({ content: "a".repeat(MAX_CONTENT_BYTES + 1) }).success).toBe(false);
  });
});
