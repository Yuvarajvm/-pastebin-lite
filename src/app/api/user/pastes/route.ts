import { NextResponse } from "next/server";
import { auth } from "@/lib/neon-auth/server";
import { getUserPastes } from "@/lib/paste-service";
import { noStoreHeaders, serializePaste } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  let user: { id: string } | null = null;
  try {
    const session = await auth.getSession();
    user = session?.data?.user ?? null;
  } catch {
    user = null;
  }

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401, headers: noStoreHeaders });
  }

  const pastes = await getUserPastes(user.id);
  return NextResponse.json({ pastes: pastes.map(serializePaste) }, { headers: noStoreHeaders });
}
