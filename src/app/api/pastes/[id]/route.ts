import { NextResponse } from "next/server";
import { noStoreHeaders, serializePaste } from "@/lib/api";
import { consumePaste, deleteUserPaste, PasteUnavailableError } from "@/lib/paste-service";
import { auth } from "@/lib/neon-auth/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const paste = await consumePaste(id);
    return NextResponse.json(serializePaste(paste), { headers: noStoreHeaders });
  } catch (error) {
    if (error instanceof PasteUnavailableError) {
      return NextResponse.json({ error: "Paste not found." }, { status: 404, headers: noStoreHeaders });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;
  const deleted = await deleteUserPaste(id, user.id);
  if (!deleted) {
    return NextResponse.json(
      { error: "Paste not found or you are not authorized to delete it." },
      { status: 404, headers: noStoreHeaders }
    );
  }
  return NextResponse.json({ success: true, message: "Paste deleted." }, { headers: noStoreHeaders });
}
