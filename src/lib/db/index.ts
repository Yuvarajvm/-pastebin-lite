import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let database: PostgresJsDatabase<typeof schema> | undefined;

/** Creates the server-only database client lazily so builds do not require production secrets. */
export function getDb() {
  if (database) return database;
  // Neon pooled connections are appropriate for request-per-invocation web traffic.
  // Drizzle CLI migrations deliberately use the direct DATABASE_URL instead.
  const connectionString = process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required to access the paste database.");
  const client = postgres(connectionString, { prepare: false });
  database = drizzle(client, { schema });
  return database;
}
