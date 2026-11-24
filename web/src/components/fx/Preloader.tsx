"use client";

import { useEffect, useState } from "react";
import styles from "./fx.module.css";

/**
 * First visit only: the mark and a count while the opening frames of the film arrive, then a
 * curtain lifts. Never longer than 2.2 s, and skipped entirely with reduced motion.
 */
export default function Preloader() {
  const [pct, setPct] = useState(0);
  const [gone, setGone] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("ust-pre") === "1";
      sessionStorage.setItem("ust-pre", "1");
    } catch {
      /* storage blocked */
    }
    if (seen || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHidden(true);
      return;
    }
    const set = innerWidth * Math.min(2, devicePixelRatio || 1) < 1100 ? "m" : "d";
    const first = [1, 9, 17, 25, 33, 41, 49, 57];
    let done = 0;
    first.forEach((f) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        done++;
        setPct(Math.round((done / first.length) * 100));
      };
      img.src = `/film/${set}/f${String(f).padStart(4, "0")}.webp`;
    });
    const cap = setTimeout(() => setPct(100), 2200);
    return () => clearTimeout(cap);
  }, []);
  useEffect(() => {
    if (pct < 100) return;
    const t1 = setTimeout(() => setGone(true), 250);
    const t2 = setTimeout(() => setHidden(true), 1250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pct]);
  if (hidden) return null;
  return (
    <div className={`${styles.pre} ${gone ? styles.preGone : ""}`} aria-hidden="true">
      <div className={styles.preMark}>
        US·TRAILERS
        <i />
      </div>
      <div className={styles.preCount}>{String(pct).padStart(3, "0")}</div>
      <div className={styles.preBar}>
        <i style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
    </div>
  );
}
