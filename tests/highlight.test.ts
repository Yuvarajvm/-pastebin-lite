import { describe, expect, it } from "vitest";
import { highlightPaste } from "@/lib/highlight";

describe("highlightPaste", () => {
  it("renders known source languages and escapes fallback text", () => {
    expect(highlightPaste("const answer = 42", "javascript")).toContain("hljs");
    expect(highlightPaste("<script>alert(1)</script>", "legacy")).toContain("&lt;script&gt;");
  });
});
