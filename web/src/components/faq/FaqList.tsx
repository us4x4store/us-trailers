import { FAQ, FAQ_NOTE, type Faq } from "@/content/faq";
import styles from "./faq.module.css";

/** Server-rendered FAQ (native <details>, works without JS). Pass ids to show a subset. */
export default function FaqList({ ids, heading = true, id = "faq", page = false }: { ids?: string[]; heading?: boolean; id?: string; page?: boolean }) {
  const H = page ? "h1" : "h2";
  const items: Faq[] = ids ? ids.map((i) => FAQ.find((f) => f.id === i)!).filter(Boolean) : FAQ;
  return (
    <section id={id} className={styles.faq} aria-labelledby={`${id}-title`}>
      {heading && (
        <header className={styles.head}>
          <p className={styles.eyebrow}>Questions buyers ask</p>
          <H id={`${id}-title`} className={styles.title}>
            {page ? "Towing laws, in plain words." : "Licences, brakes, roadworthy."}
          </H>
        </header>
      )}
      {!heading && (
        <h2 id={`${id}-title`} className={styles.sub}>
          Good to know
        </h2>
      )}
      <div className={styles.list}>
        {items.map((f, i) => (
          <details key={f.id} className={styles.item} open={i === 0}>
            <summary>
              <span className={styles.n}>{String(i + 1).padStart(2, "0")}</span>
              <span>{f.q}</span>
              <i aria-hidden="true" />
            </summary>
            <div className={styles.a}>
              {f.a.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </details>
        ))}
      </div>
      <p className={styles.note}>{FAQ_NOTE}</p>
    </section>
  );
}

export function faqJsonLd(ids?: string[]) {
  const items = ids ? FAQ.filter((f) => ids.includes(f.id)) : FAQ;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a.join(" ") } })),
  };
}
