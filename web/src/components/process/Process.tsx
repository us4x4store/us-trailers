"use client";

import { useState } from "react";
import { STAGES } from "@/content/process";
import TypeDrawing from "@/components/drawings/TypeDrawing";
import styles from "./process.module.css";

const LAST = STAGES[STAGES.length - 1].week;

/** "How a commission works": a week scrubber that draws the trailer as the build progresses. */
export default function Process() {
  const [week, setWeek] = useState(2);
  const idx = STAGES.reduce((acc, s, i) => (week >= s.week ? i : acc), 0);
  const stage = STAGES[idx];
  // drawing goes from first line (week 2, your drawing) to finished (handover)
  const progress = Math.max(0.04, Math.min(1, (week - 1) / (LAST - 1)));

  return (
    <section id="process" className={styles.proc} aria-labelledby="proc-title">
      <header className={styles.head}>
        <p className={styles.eyebrow}>How a commission works</p>
        <h2 id="proc-title" className={styles.title}>
          Twelve weeks, start to keys.
        </h2>
        <p className={styles.lede}>Drag through a typical build. You always know what we&apos;re doing and what we need from you.</p>
      </header>

      <div className={styles.sheet}>
        <div className={styles.art}>
          <TypeDrawing kind="toyhauler" progress={progress} label={`Drawing of the trailer at week ${week}: ${stage.title}`} />
        </div>

        <div className={styles.now} aria-live="polite">
          <span className={styles.wk}>Week {week === 0 ? "0" : week}</span>
          <h3>{stage.title}</h3>
          <dl>
            <div>
              <dt>We</dt>
              <dd>{stage.what}</dd>
            </div>
            <div>
              <dt>You</dt>
              <dd>{stage.you}</dd>
            </div>
          </dl>
        </div>

        <div className={styles.scrub}>
          <input
            type="range"
            min={0}
            max={LAST}
            step={1}
            value={week}
            onChange={(e) => setWeek(+e.target.value)}
            aria-label="Week of the build"
            aria-valuetext={`Week ${week}: ${stage.title}`}
          />
          <ol className={styles.ticks} aria-hidden="true">
            {STAGES.map((s, i) => (
              <li key={s.week} style={{ left: `${(s.week / LAST) * 100}%` }} data-on={i <= idx || undefined}>
                <button type="button" tabIndex={-1} onClick={() => setWeek(s.week)}>
                  <i />
                  <span>{s.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <p className={styles.note}>Typical timeline. Your dates are fixed in your drawing.</p>
    </section>
  );
}
