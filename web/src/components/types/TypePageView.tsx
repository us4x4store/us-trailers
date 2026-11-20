import type { Metadata } from "next";
import Link from "next/link";
import { TYPES, typeBySlug } from "@/content/types";
import TypeDrawing from "@/components/drawings/TypeDrawing";
import FaqList, { faqJsonLd } from "@/components/faq/FaqList";
import { SITE_URL } from "@/content/site";
import Photo from "@/components/Photo";
import { TYPE_IMAGE } from "@/content/images";
import styles from "./type.module.css";

/** each type opens the designer already set to that kind of trailer */
const DESIGN_LINK: Record<string, string> = {
  "toy-haulers": "/?build=L48-A2-C0-R1-S1#design",
  "off-road-trailers": "/?build=O30-A1-C2-R0-S1#design",
  "gooseneck-fifth-wheel-trailers": "/?build=G60-A2-C0-R0-S1#design",
};

export function typeMetadata(slug: string): Metadata {
  const t = typeBySlug(slug);
  if (!t) return {};
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: `/${t.slug}` },
    openGraph: { title: t.title, description: t.description, url: `/${t.slug}`, locale: "en_ZA", type: "website", siteName: "US Trailers" },
  };
}

export default function TypePageView({ slug }: { slug: string }) {
  const t = typeBySlug(slug)!;
  const i = TYPES.indexOf(t);
  const next = TYPES[(i + 1) % TYPES.length];
  const ld = [
    faqJsonLd(t.faq),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: t.short,
      serviceType: "Custom trailer manufacturing",
      description: t.description,
      provider: { "@type": "LocalBusiness", name: "US Trailers", address: { "@type": "PostalAddress", addressLocality: "Cape Town", addressCountry: "ZA" } },
      areaServed: { "@type": "Country", name: "South Africa" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "US Trailers", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: t.short, item: `${SITE_URL}/${t.slug}` },
      ],
    },
  ];

  return (
    <main id="main" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href="/">US Trailers</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{t.short}</span>
      </nav>

      <header className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Sheet {String(i + 1).padStart(2, "0")} · Built in Cape Town</p>
          <h1 className={styles.h1}>{t.h1}</h1>
          <p className={styles.lede}>{t.intro}</p>
          <div className={styles.ctas}>
            <Link className={styles.primary} href="/#enquire">
              Get a price
            </Link>
            {DESIGN_LINK[t.slug] ? (
              <Link className={styles.secondary} href={DESIGN_LINK[t.slug]}>
                Design one now
              </Link>
            ) : (
              <Link className={styles.secondary} href="/faq">
                Read the towing laws
              </Link>
            )}
          </div>
        </div>
        <div className={styles.art}>
          <TypeDrawing kind={t.drawing} label={`Side elevation drawing: ${t.short}`} />
        </div>
      </header>

      {TYPE_IMAGE[t.slug] && <Photo img={TYPE_IMAGE[t.slug]} sizes="100vw" eager className={styles.photo} />}

      <section className={styles.spec} aria-labelledby="spec">
        <h2 id="spec" className={styles.h2}>
          Typical specification
        </h2>
        <dl>
          {t.spec.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.specNote}>Example ranges. Your drawing sets the real numbers.</p>
      </section>

      <section className={styles.who} aria-labelledby="who">
        <h2 id="who" className={styles.h2}>
          Who it&apos;s for
        </h2>
        <ul>
          {t.forWho.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </section>

      <section className={styles.points} aria-labelledby="how">
        <h2 id="how" className={styles.h2}>
          How we build it
        </h2>
        <ol>
          {t.points.map((p, k) => (
            <li key={p.h}>
              <span className={styles.pn}>{String.fromCharCode(65 + k)}</span>
              <h3>{p.h}</h3>
              <p>{p.p}</p>
            </li>
          ))}
        </ol>
      </section>

      <aside className={styles.rules} aria-labelledby="rules">
        <h2 id="rules" className={styles.h2}>
          The rules that apply
        </h2>
        <ul>
          {t.rules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </aside>

      <FaqList ids={t.faq} heading={false} id={`faq-${t.slug}`} />

      <div className={styles.stickyCta}>
        <span>{t.short}, built for you</span>
        <Link href="/#enquire">Get a price</Link>
      </div>

      <section className={styles.close}>
        <h2 className={styles.closeH}>Commission yours, not one for sale off a floor.</h2>
        <div className={styles.ctas}>
          <Link className={styles.primary} href="/#enquire">
            Get a price
          </Link>
          <Link className={styles.secondary} href={`/${next.slug}`}>
            Next sheet: {next.short} →
          </Link>
        </div>
      </section>
    </main>
  );
}
