import { describe, expect, it } from "vitest";
import AboutPage, { metadata as aboutMetadata } from "@/app/about/page";
import ContactPage, { metadata as contactMetadata } from "@/app/contact/page";

describe("Public Pages", () => {
  it("exports valid metadata for the About page", () => {
    expect(aboutMetadata.title).toContain("About");
    expect(aboutMetadata.description).toBeDefined();
    expect(typeof AboutPage).toBe("function");
  });

  it("exports valid metadata for the Contact Us page", () => {
    expect(contactMetadata.title).toContain("Contact Us");
    expect(contactMetadata.description).toBeDefined();
    expect(typeof ContactPage).toBe("function");
  });
});
