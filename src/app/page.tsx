import { PasteForm } from "@/components/paste-form";
import { SiteHeader } from "@/components/site-header";
import { CheckIcon } from "@/components/icons";

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
          <div role="status" className="notice notice-success flex items-center gap-2" style={{ margin: "0 0 24px" }}>
            <CheckIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Your account has been soft-deleted and all active sessions have been terminated.</span>
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
