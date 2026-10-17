import { z } from "zod";

export const MAX_CONTENT_BYTES = 1024 * 1024;
export const MAX_TTL_SECONDS = 31_536_000;
export const MAX_VIEWS = 1_000_000;
export const SUPPORTED_LANGUAGES = ["text", "javascript", "typescript", "json", "python", "html", "css", "sql", "bash"] as const;

const positiveInteger = (maximum: number) =>
  z.number().int().safe().min(1).max(maximum).optional();

export const createPasteSchema = z
  .object({
    title: z.string().trim().max(120).optional().transform((value) => value || "Untitled"),
    content: z.string().min(1, "Content is required."),
    language: z.enum(SUPPORTED_LANGUAGES).optional().default("text"),
    ttl_seconds: positiveInteger(MAX_TTL_SECONDS),
    max_views: positiveInteger(MAX_VIEWS)
  })
  .strict()
  .superRefine(({ content }, ctx) => {
    if (new TextEncoder().encode(content).byteLength > MAX_CONTENT_BYTES) {
      ctx.addIssue({ code: "custom", path: ["content"], message: "Content must be at most 1 MiB UTF-8." });
    }
  });

export type CreatePasteInput = z.infer<typeof createPasteSchema>;
