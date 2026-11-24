"use client";

import { useEffect, useState } from "react";
import styles from "./fx.module.css";

/**
 * First visit only: the mark and a count while the hero still arrives, then a curtain lifts.
 * Never longer than about a second, and skipped entirely with reduced motion.
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
    // lift as soon as the hero still is in (it is the first thing you see), never later than 1 s
    const hero = document.querySelector<HTMLImageElement>("#film picture img");
    const tick = setInterval(() => setPct((v) => (v >= 90 ? v : v + 15)), 90);
    const finish = () => setPct(100);
    if (hero?.complete) finish();
    else hero?.addEventListener("load", finish, { once: true });
    const cap = setTimeout(finish, 1000);
    return () => {
      clearTimeout(cap);
      clearInterval(tick);
    };
  }, []);
  useEffect(() => {
    if (pct < 100) return;
    const t1 = setTimeout(() => setGone(true), 120);
    const t2 = setTimeout(() => setHidden(true), 1100);
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
