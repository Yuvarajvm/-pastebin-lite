import { PasteForm } from "@/components/paste-form";
import { SiteHeader } from "@/components/site-header";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ account_deleted?: string }>;
}) {
  const params = await searchParams;
  const isAccountDeleted = params?.account_deleted === "1";

  return (
    <>
      <SiteHeader />
      <main className="shell composer-page">
        {isAccountDeleted && (
          <div role="status" className="notice notice-success" style={{ margin: "0 0 24px" }}>
            ✓ Your account has been soft-deleted and all active sessions have been terminated.
          </div>
        )}
        <section className="page-intro">
          <p className="eyebrow">SHARE TEXT, SIMPLY</p>
          <h1>Create a paste</h1>
          <p>A private link for code, notes, and anything in between.</p>
        </section>
        <PasteForm />
        <section id="how-it-works" className="how-it-works">
          <strong>Private by design</strong>
          <span>Every paste has a unique link. Optional time and view limits are enforced on each read.</span>
        </section>
      </main>
    </>
  );
}
