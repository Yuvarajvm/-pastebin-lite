import { check, index, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id", { length: 24 }).primaryKey(),
  username: varchar("username", { length: 32 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 24 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const pastes = pgTable(
  "pastes",
  {
    id: varchar("id", { length: 12 }).primaryKey(),
    userId: text("user_id"),
    title: varchar("title", { length: 120 }).notNull().default("Untitled"),
    content: text("content").notNull(),
    language: varchar("language", { length: 20 }).notNull().default("text"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    maxViews: integer("max_views"),
    viewsCount: integer("views_count").notNull().default(0)
  },
  (table) => [
    index("pastes_user_id_idx").on(table.userId),
    check("positive_max_views", sql`${table.maxViews} IS NULL OR ${table.maxViews} BETWEEN 1 AND 1000000`),
    check("nonnegative_views", sql`${table.viewsCount} >= 0`),
    check("views_within_limit", sql`${table.maxViews} IS NULL OR ${table.viewsCount} <= ${table.maxViews}`),
    check("supported_language", sql`${table.language} IN ('text', 'javascript', 'typescript', 'json', 'python', 'html', 'css', 'sql', 'bash')`)
  ]
);

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Paste = typeof pastes.$inferSelect;
