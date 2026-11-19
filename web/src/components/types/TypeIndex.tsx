import Link from "next/link";
import { TYPES } from "@/content/types";
import RevealDrawing from "@/components/drawings/RevealDrawing";
import styles from "./types.module.css";

/** Home-page index of what we build: one drawing sheet per type, each linking to its page. */
export default function TypeIndex() {
  return (
    <section id="types" className={styles.index} aria-labelledby="types-title">
      <header className={styles.head}>
        <p className={styles.eyebrow}>What we build</p>
        <h2 id="types-title" className={styles.title}>
          One drawing. One owner.
        </h2>
        <p className={styles.lede}>Four kinds of work leave our workshop. Every one starts as a drawing for one person.</p>
      </header>
      <ul className={styles.grid}>
        {TYPES.map((t, i) => (
          <li key={t.slug}>
            <Link href={`/${t.slug}`} className={styles.card}>
              <span className={styles.no}>Sheet {String(i + 1).padStart(2, "0")}</span>
              <RevealDrawing kind={t.drawing} label={`Side elevation drawing: ${t.short}`} decorative />
              <span className={styles.name}>{t.short}</span>
              <span className={styles.go}>Open the sheet →</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
