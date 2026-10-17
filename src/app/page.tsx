import { PasteForm } from "@/components/paste-form";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return <><SiteHeader /><main className="shell composer-page">
    <section className="page-intro"><p className="eyebrow">SHARE TEXT, SIMPLY</p><h1>Create a paste</h1><p>A private link for code, notes, and anything in between.</p></section>
    <PasteForm />
    <section id="how-it-works" className="how-it-works"><strong>Private by design</strong><span>Every paste has a unique link. Optional time and view limits are enforced on each read.</span></section>
  </main></>;
}
