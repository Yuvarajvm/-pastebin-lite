import { NextResponse } from "next/server";
import { auth } from "@/lib/neon-auth/server";
import { noStoreHeaders } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth.getSession();
    const user = session?.data?.user ?? null;
    return NextResponse.json({ user }, { headers: noStoreHeaders });
  } catch {
    return NextResponse.json({ user: null }, { headers: noStoreHeaders });
  }
}
