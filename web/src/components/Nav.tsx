import styles from "./nav.module.css";

/* WhatsApp number pending from Justin (questions batch 1, Q12). Link goes to the enquiry section until then. */
export default function Nav() {
  return (
    <header className={styles.nav}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <a href="#top" className={styles.wm} aria-label="US Trailers, home">
        US·TRAILERS
        <i aria-hidden="true" />
      </a>
      <nav className={styles.links} aria-label="Main">
        <a href="#film">The build</a>
        <a href="#drive">Tow it</a>
        <a href="#enquire">Start your drawing</a>
      </nav>
      <a href="#enquire" className={styles.wa}>
        Enquire
      </a>
    </header>
  );
}
