import type { Metadata } from "next";
import Link from "next/link";
import Photo from "@/components/Photo";
import { BUILDS } from "@/content/builds";
import { decodeBuild, priceRange, rand, specs } from "@/trailer/pricing";
import t from "@/components/types/type.module.css";
import s from "@/components/pages/pages.module.css";

export const metadata: Metadata = {
  title: "Custom trailer builds: toy haulers, campers, goosenecks | US Trailers",
  description: "How a custom trailer comes together: the client's brief, the drawing, the build and the result, with the specs. Toy haulers, off-road campers, goosenecks and rebuilds from Cape Town.",
  alternates: { canonical: "/builds" },
};

const fmt = (n: number) => n.toLocaleString("en-ZA").replace(/,/g, " ");

export default function Builds() {
  return (
    <main id="main" className={t.page}>
      <nav className={t.crumbs} aria-label="Breadcrumb">
        <Link href="/">US Trailers</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Builds</span>
      </nav>
      <header className={t.hero}>
        <div className={t.copy}>
          <p className={t.eyebrow}>Builds · one client each</p>
          <h1 className={t.h1}>Every one starts with a problem.</h1>
          <p className={t.lede}>A trailer that shook the bikes loose. A bakkie pushed around on the passes. A camper that couldn&apos;t reach the back sites. Here is how four briefs became four drawings, and four trailers.</p>
          <div className={t.ctas}>
            <Link className={t.primary} href="/contact">
              Start your brief
            </Link>
            <Link className={t.secondary} href="/#design">
              Design one now
            </Link>
          </div>
        </div>
        <ol className={s.index} aria-label="The builds on this page">
          {BUILDS.map((b) => (
            <li key={b.slug}>
              <a href={`#${b.slug}`}>
                {b.title}
                <small>{b.code ? b.code.split("-")[0] : "Rebuild"}</small>
              </a>
            </li>
          ))}
        </ol>
      </header>
      {/* PLACEHOLDER: replace with real client builds and photos (questions batch 1, Q14) */}
      <p className={s.note}>Example commissions, drawn from the briefs Cape Town buyers bring us. Specs are worked out by the same model as the designer. Real client builds and photos replace these as they are handed over.</p>

      <div className={s.stories}>
        {BUILDS.map((b) => {
          const cfg = decodeBuild(b.code);
          const sp = cfg ? specs(cfg) : null;
          const pr = cfg ? priceRange(cfg) : null;
          return (
            <article key={b.slug} id={b.slug} className={s.story} aria-labelledby={`${b.slug}-t`}>
              <div className={s.storyImg}>
                <Photo img={b.image} sizes="(max-width: 860px) 100vw, 55vw" />
              </div>
              <div className={s.storyBody}>
                <p className={s.storyK}>
                  {b.code ?? "Rebuild"} · {b.where}
                </p>
                <h2 id={`${b.slug}-t`} className={s.storyT}>
                  {b.title}
                </h2>
                <dl className={s.beats}>
                  <div>
                    <dt>The need</dt>
                    <dd>{b.need}</dd>
                  </div>
                  <div>
                    <dt>The drawing</dt>
                    <dd>{b.design}</dd>
                  </div>
                  <div>
                    <dt>The build</dt>
                    <dd>{b.build}</dd>
                  </div>
                  <div>
                    <dt>The result</dt>
                    <dd>{b.result}</dd>
                  </div>
                </dl>
                {sp && pr && (
                  <div className={s.sheet} role="group" aria-label="Specification">
                    <div>
                      <span>Overall</span>
                      {fmt(sp.overallMm)} mm
                    </div>
                    <div>
                      <span>Tare / GVM</span>
                      {fmt(sp.tare)} / {fmt(sp.gvm)} kg
                    </div>
                    <div>
                      <span>Licence</span>Code {sp.licence}
                    </div>
                    <div>
                      <span>Example price</span>
                      {rand(pr[0])}–{rand(pr[1]).slice(1)}
                    </div>
                  </div>
                )}
                <ul className={s.tags} aria-label="Fitted">
                  {b.extras.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <div className={s.storyCtas}>
                  {b.code ? (
                    <Link className={t.primary} href={`/?build=${b.code}#design`}>
                      Start from this build
                    </Link>
                  ) : (
                    <Link className={t.primary} href="/modifications-and-upgrades">
                      Rebuilds and upgrades
                    </Link>
                  )}
                  <Link className={t.secondary} href="/contact">
                    Ask about one like it
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section className={t.close}>
        <h2 className={t.closeH}>Bring us the problem. We&apos;ll draw the trailer.</h2>
        <div className={t.ctas}>
          <Link className={t.primary} href="/contact">
            Start your brief
          </Link>
          <Link className={t.secondary} href="/how-it-works">
            How a build works →
          </Link>
        </div>
      </section>
    </main>
  );
}
