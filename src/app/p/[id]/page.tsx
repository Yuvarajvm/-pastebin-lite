import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { consumePaste, PasteUnavailableError } from "@/lib/paste-service";
import { highlightPaste } from "@/lib/highlight";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

export default async function PastePage({ params }: { params: Promise<{ id: string }> }) {
  noStore(); const { id } = await params;
  let paste: Awaited<ReturnType<typeof consumePaste>>;
  try { paste = await consumePaste(id); }
  catch (error) { if (error instanceof PasteUnavailableError) notFound(); throw error; }
  const highlighted = highlightPaste(paste.content, paste.language);
  return <><SiteHeader /><main className="shell paste-page"><div className="paste-topline"><Link href="/">← New paste</Link><span>{paste.language}</span></div>
    <h1>{paste.title}</h1><div className="paste-meta"><span>Created {paste.createdAt.toLocaleString()}</span>{paste.expiresAt && <span>Expires {paste.expiresAt.toLocaleString()}</span>}<span>View {paste.viewsCount}{paste.maxViews ? ` of ${paste.maxViews}` : ""}</span></div>
    <pre className="rendered-paste"><code className={`hljs language-${paste.language}`} dangerouslySetInnerHTML={{ __html: highlighted }} /></pre>
  </main></>;
}
