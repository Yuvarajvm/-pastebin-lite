import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Deliberately use a separate process-level connection URL so application data is never touched.
const testUrl = process.env.TEST_DATABASE_URL;
const describeIntegration = testUrl ? describe : describe.skip;

describeIntegration("paste service integration", () => {
  let sql: import("postgres").Sql;
  let consumePaste: typeof import("@/lib/paste-service").consumePaste;
  let createPaste: typeof import("@/lib/paste-service").createPaste;
  let PasteUnavailableError: typeof import("@/lib/paste-service").PasteUnavailableError;

  beforeAll(async () => {
    process.env.DATABASE_URL = testUrl;
    process.env.DATABASE_URL_POOLED = testUrl;
    const postgres = (await import("postgres")).default;
    sql = postgres(testUrl!, { prepare: false });
    await sql.unsafe(`CREATE TABLE IF NOT EXISTS pastes (
      id varchar(12) primary key, user_id varchar(24), title varchar(120) not null default 'Untitled', content text not null,
      language varchar(20) not null default 'text', created_at timestamptz not null default now(),
      expires_at timestamptz, max_views integer, views_count integer not null default 0,
      CONSTRAINT positive_max_views CHECK (max_views IS NULL OR max_views BETWEEN 1 AND 1000000),
      CONSTRAINT nonnegative_views CHECK (views_count >= 0),
      CONSTRAINT views_within_limit CHECK (max_views IS NULL OR views_count <= max_views),
      CONSTRAINT supported_language CHECK (language IN ('text', 'javascript', 'typescript', 'json', 'python', 'html', 'css', 'sql', 'bash'))
    )`);
    ({ consumePaste, createPaste, PasteUnavailableError } = await import("@/lib/paste-service"));
  });
  afterAll(async () => { await sql?.end(); });

  it("allows exactly one concurrent consumer of a final view", async () => {
    const paste = await createPaste({ content: "race", title: "Burn after read", language: "text", max_views: 1 });
    expect(paste.title).toBe("Burn after read");
    const results = await Promise.allSettled([consumePaste(paste.id), consumePaste(paste.id)]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected" && result.reason instanceof PasteUnavailableError)).toHaveLength(1);
    await sql`DELETE FROM pastes WHERE id = ${paste.id}`;
  }, 15000);
  it("does not consume an already-expired paste", async () => {
    const expiredId = `exp_${Date.now().toString().slice(-8)}`;
    const [row] = await sql<{ id: string }[]>`INSERT INTO pastes (id, content, expires_at) VALUES (${expiredId}, 'old', NOW() - INTERVAL '1 minute') RETURNING id`;
    await expect(consumePaste(row.id)).rejects.toBeInstanceOf(PasteUnavailableError);
    await sql`DELETE FROM pastes WHERE id = ${row.id}`;
  }, 15000);
});
