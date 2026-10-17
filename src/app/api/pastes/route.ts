import { NextResponse } from "next/server";
import { createPaste } from "@/lib/paste-service";
import { createPasteSchema } from "@/lib/validation";
import { noStoreHeaders } from "@/lib/api";
import { auth } from "@/lib/neon-auth/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400, headers: noStoreHeaders });
  }

  const parsed = createPasteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid paste request.", details: parsed.error.flatten() },
      { status: 400, headers: noStoreHeaders }
    );
  }

  let userId: string | null = null;
  try {
    const session = await auth.getSession();
    userId = session?.data?.user?.id ?? null;
  } catch {
    userId = null;
  }

  const paste = await createPaste(parsed.data, userId);
  const origin = new URL(request.url).origin;

  return NextResponse.json(
    {
      id: paste.id,
      url: `${origin}/p/${paste.id}`,
      title: paste.title,
      language: paste.language,
      expires_at: paste.expiresAt?.toISOString() ?? null,
      max_views: paste.maxViews
    },
    { status: 201, headers: noStoreHeaders }
  );
}
