import styles from "./fx.module.css";

const WORDS = ["V-nose", "Gloss black", "Polished aluminium", "RGB underglow", "E-track", "400 kg ramp", "Built in Cape Town"];

/** A slow band of outlined spec words between scenes. Decorative: hidden from screen readers. */
export default function Marquee() {
  const run = [...WORDS, ...WORDS];
  return (
    <div className={styles.marquee} aria-hidden="true">
      <div className={styles.track}>
        {run.map((w, i) => (
          <span key={i}>
            {w}
            <i>✦</i>
          </span>
        ))}
      </div>
    </div>
  );
}
