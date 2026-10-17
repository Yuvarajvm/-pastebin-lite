import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { noStoreHeaders } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getDb().execute(sql`SELECT 1`);
    return NextResponse.json({ status: "ok" }, { headers: noStoreHeaders });
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503, headers: noStoreHeaders });
  }
}
