"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FILM, FILM_CHAPTERS, FILM_PARTS } from "@/content/film";
import { track } from "@/lib/track";
import styles from "./buildfilm.module.css";

const N = FILM.frames;
const pad = (i: number) => String(i).padStart(4, "0");
const src = (set: "d" | "m", i: number) => `/film/${set}/f${pad(i)}.webp`;

/**
 * The build, frame by frame: a photoreal film rendered offline (Blender Cycles), scrubbed by scroll.
 * Frames stream in coarse-to-fine so the film is usable after a few hundred kilobytes; the canvas
 * always shows the nearest frame that has arrived.
 */
export default function BuildFilm() {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const frames = useRef<(HTMLImageElement | null)[]>([]);
  const want = useRef(1);
  const drawn = useRef(-1);
  const [frame, setFrame] = useState(1);
  const [ready, setReady] = useState(0);

  // which set of frames to load: phones get 720-wide frames
  const set = useMemo<"d" | "m">(() => (typeof window !== "undefined" && window.innerWidth * Math.min(2, window.devicePixelRatio || 1) < 1100 ? "m" : "d"), []);

  // draw the nearest loaded frame, cover-fitted
  const draw = () => {
    const c = canvas.current;
    if (!c) return;
    const target = want.current;
    let best = -1;
    for (let d = 0; d < N; d++) {
      if (frames.current[target - d]?.complete && frames.current[target - d]?.naturalWidth) {
        best = target - d;
        break;
      }
      if (frames.current[target + d]?.complete && frames.current[target + d]?.naturalWidth) {
        best = target + d;
        break;
      }
    }
    if (best < 0 || best === drawn.current) return;
    const img = frames.current[best]!;
    const ctx = c.getContext("2d")!;
    const cw = c.width;
    const ch = c.height;
    const portrait = ch > cw * 1.1;
    // landscape: cover the screen. Portrait (phones): keep the whole trailer, a little enlarged,
    // and melt the frame's top and bottom edges into the black studio
    const s = portrait ? (cw / img.naturalWidth) * 1.32 : Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    const y = portrait ? ch * 0.46 - h / 2 : (ch - h) / 2;
    ctx.fillStyle = "#050506";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - w) / 2, y, w, h);
    if (portrait) {
      const fade = h * 0.22;
      for (const [y0, y1] of [[y, y + fade], [y + h, y + h - fade]]) {
        const g = ctx.createLinearGradient(0, y0, 0, y1);
        g.addColorStop(0, "rgba(5,5,6,1)");
        g.addColorStop(1, "rgba(5,5,6,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, Math.min(y0, y1), cw, fade);
      }
    }
    drawn.current = best;
  };

  // size the canvas to the screen
  useEffect(() => {
    const c = canvas.current!;
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
      drawn.current = -1;
      draw();
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // stream frames: every 8th first, then every 4th, 2nd, then the rest
  useEffect(() => {
    frames.current = new Array(N + 1).fill(null);
    const order: number[] = [];
    const seen = new Set<number>();
    for (const step of [8, 4, 2, 1])
      for (let i = 1; i <= N; i += step)
        if (!seen.has(i)) {
          seen.add(i);
          order.push(i);
        }
    let cancelled = false;
    let inflight = 0;
    let k = 0;
    let loaded = 0;
    const next = () => {
      while (!cancelled && inflight < 6 && k < order.length) {
        const i = order[k++];
        const img = new Image();
        img.decoding = "async";
        inflight++;
        img.onload = img.onerror = () => {
          inflight--;
          loaded++;
          if (loaded % 10 === 0 || loaded === N) setReady(loaded);
          if (Math.abs(i - want.current) < 10) draw();
          next();
        };
        img.src = src(set, i);
        frames.current[i] = img;
      }
    };
    next();
    return () => {
      cancelled = true;
    };
  }, [set]); // eslint-disable-line react-hooks/exhaustive-deps

  // scroll drives the frame
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = section.current!;
        const r = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        const p = Math.min(1, Math.max(0, -r.top / total));
        const f = 1 + Math.round(p * (N - 1));
        if (f !== want.current) {
          want.current = f;
          draw();
          setFrame(f);
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const chapterIdx = FILM_CHAPTERS.reduce((acc, c, i) => (frame >= c.from ? i : acc), 0);
  const ch = FILM_CHAPTERS[chapterIdx];
  const isIntro = frame < 8;
  const isEnd = frame >= FILM.finale[0] + 20;
  const part = [...FILM_PARTS].reverse().find((p) => frame >= p.start && frame <= p.end + 10);
  const built = FILM_PARTS.filter((p) => frame >= p.end).length;

  const finished = useRef(false);
  useEffect(() => {
    if (frame >= N - 2 && !finished.current) {
      finished.current = true;
      track("film_finished");
    }
  }, [frame]);

  return (
    <section ref={section} id="film" className={styles.film} aria-label="Watch a US Trailers toy hauler being built, part by part">
      <div className={styles.stage}>
        {/* the finished trailer behind the headline; the build film takes over as you scroll */}
        <picture>
          <source media="(max-width: 760px)" srcSet="/film/hero-m.webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={`${styles.poster} ${isIntro ? "" : styles.posterOff}`} src="/film/hero.webp" alt="A gloss-black Texan-style V-nose toy hauler in a dark studio, polished wheels, RGB underglow reflected in the floor" fetchPriority="high" />
        </picture>
        <canvas ref={canvas} className={`${styles.canvas} ${isIntro ? styles.canvasOff : ""}`} aria-hidden="true" />

        <div className={`${styles.scrim} ${isIntro || isEnd ? styles.scrimOn : ""}`} aria-hidden="true" />
        <div className={`${styles.intro} ${isIntro ? styles.show : ""}`} inert={!isIntro}>
          <p className={styles.kicker}>Bespoke Texan-style toy haulers · Cape Town</p>
          <h1 className={styles.h1}>
            Built for
            <br />
            <em>your toys.</em>
          </h1>
          <p className={styles.lede}>V-nose haulers for ATVs, side-by-sides and bikes. Gloss paint, polished aluminium, RGB from the underglow to the garage. Scroll, and watch one built, part by part.</p>
          <div className={styles.ctas}>
            <a className={styles.primary} href="#enquire">
              Get a price
            </a>
            <span className={styles.cue} aria-hidden="true">
              Scroll to build ↓
            </span>
          </div>
        </div>

        <div className={`${styles.chapter} ${!isIntro && !isEnd ? styles.show : ""}`} aria-live="polite">
          <span className={styles.chn}>{ch.n}</span>
          <h2 className={styles.cht}>{ch.title}</h2>
          <p className={styles.chl}>{ch.line}</p>
        </div>

        <div className={`${styles.part} ${part && !isIntro && !isEnd ? styles.show : ""}`}>
          {part && (
            <>
              <b>{part.name}</b>
              <span>{part.job}</span>
            </>
          )}
        </div>

        <div className={`${styles.end} ${isEnd ? styles.show : ""}`} inert={!isEnd}>
          <p className={styles.kicker}>Handover</p>
          <h2 className={styles.endT}>Yours, built once.</h2>
          <div className={styles.ctas}>
            <a className={styles.primary} href="#enquire">
              Get a price for yours
            </a>
            <a className={styles.ghost} href="#design">
              Design yours →
            </a>
          </div>
        </div>

        <div className={styles.meter} aria-hidden="true">
          <span>
            {String(built).padStart(2, "0")} / {FILM_PARTS.length} parts
          </span>
          <div className={styles.track}>
            <i style={{ transform: `scaleX(${(frame - 1) / (N - 1)})` }} />
            {FILM_CHAPTERS.map((c) => (
              <em key={c.n} style={{ left: `${((c.from - 1) / (N - 1)) * 100}%` }} />
            ))}
          </div>
          <span>{ready < N ? `Loading film ${Math.round((ready / N) * 100)}%` : ch.title}</span>
        </div>
      </div>
    </section>
  );
}
