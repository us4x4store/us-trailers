import Link from "next/link";
import { TYPES } from "@/content/types";
import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.foot}>
      <div className={styles.wm}>
        US·TRAILERS
        <i aria-hidden="true" />
        <span>Drawn &amp; built in Cape Town</span>
      </div>
      <nav aria-label="Trailers" className={styles.col}>
        <h2>Trailers</h2>
        {TYPES.map((t) => (
          <Link key={t.slug} href={`/${t.slug}`}>
            {t.short}
          </Link>
        ))}
      </nav>
      <nav aria-label="Site" className={styles.col}>
        <h2>Site</h2>
        <Link href="/#film">Watch the build</Link>
        <Link href="/#drive">Tow it</Link>
        <Link href="/#design">Design yours</Link>
        <Link href="/faq">Towing laws &amp; FAQ</Link>
        <Link href="/#enquire">Start your drawing</Link>
      </nav>
      <p className={styles.small}>© {2026} US Trailers. Concept drawings and example specs shown until build photos are published.</p>
    </footer>
  );
}
