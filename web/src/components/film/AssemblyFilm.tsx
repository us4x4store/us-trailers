"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildTrailer, CHAPTERS, DEFAULT_CONFIG, overallLength, tareKg } from "@/trailer/model";
import { RANGES, chapterAt, film } from "./timeline";
import { DrawingPoster } from "./DrawingPoster";
import styles from "./film.module.css";

const FilmScene = dynamic(() => import("./FilmScene"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

export default function AssemblyFilm() {
  const section = useRef<HTMLElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  const [active, setActive] = useState(-1);
  const [ready, setReady] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [lights, setLights] = useState(false);
  const [ramp, setRamp] = useState(false);
  const parts = useMemo(() => buildTrailer(DEFAULT_CONFIG), []);

  useEffect(() => {
    film.label = label.current;
    const onActive = () => setActive(film.active);
    film.listeners.add(onActive);
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        film.p = self.progress;
        const c = chapterAt(self.progress);
        setChapter((prev) => (prev === c ? prev : c));
        if (ruler.current) ruler.current.style.transform = `scaleX(${self.progress})`;
      },
    });
    // mount the 3D only once the page has painted the poster (keeps first paint fast)
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    idle(() => setReady(true));
    return () => {
      st.kill();
      film.listeners.delete(onActive);
      film.label = null;
    };
  }, []);

  const ch = CHAPTERS[chapter];
  const part = active >= 0 ? parts[active] : null;
  const isIntro = chapter === 0;
  const isEnd = chapter === CHAPTERS.length - 1;
  const doneCount = parts.filter((_, i) => i <= active).length;

  const toggleExplode = (v: boolean) => {
    film.explode = v ? 1 : 0;
    setExploded(v);
  };

  return (
    <section ref={section} className={styles.film} aria-label="Watch a US Trailer being built, part by part">
      <div className={styles.stage}>
        <div className={styles.canvas} aria-hidden="true">
          <DrawingPoster faded={ready} />
          {ready && <FilmScene />}
        </div>

        {/* headline over the drawing */}
        <div className={`${styles.intro} ${isIntro ? styles.show : ""}`}>
          <p className={styles.eyebrow}>Bespoke trailers · Cape Town</p>
          <h1 className={styles.h1}>
            Drawn for you.
            <br />
            <em>Built once.</em>
          </h1>
          <p className={styles.lede}>
            Designed around your vehicle, your licence code and your load. Scroll, and watch one being built from the first line to the last weld.
          </p>
        </div>

        {/* chapter heading */}
        <div className={`${styles.chapter} ${!isIntro ? styles.show : ""}`} aria-live="polite">
          <span className={styles.chn}>{ch.n}</span>
          <h2 className={styles.cht}>{ch.title}</h2>
          <p className={styles.chl}>{ch.line}</p>
        </div>

        {/* part callout, positioned on the part by the scene */}
        <div ref={label} className={styles.label} style={{ opacity: 0 }}>
          {part && !isIntro && (
            <>
              <span className={styles.leader} data-leader />
              <span className={styles.dot} />
              <div className={styles.card} data-card>
                <span className={styles.cardName}>{part.name}</span>
                <span className={styles.cardJob}>{part.job}</span>
                <span className={styles.cardSpec}>
                  {part.material} · {part.spec}
                </span>
              </div>
            </>
          )}
        </div>

        {/* bill of materials */}
        <ol className={`${styles.bom} ${!isIntro ? styles.show : ""}`} aria-label="Bill of materials">
          {parts.map((p, i) => (
            <li key={p.id} className={i <= active ? styles.done : ""} data-active={i === active || undefined}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {p.name}
            </li>
          ))}
        </ol>

        {/* title block + controls */}
        <div className={styles.tb}>
          <span>Dwg</span>
          <b>UST-001</b>
          <span>Type</span>
          <b>Toy hauler, {DEFAULT_CONFIG.axles === 2 ? "tandem" : "single"} axle</b>
          <span>Overall</span>
          <b>{(overallLength(DEFAULT_CONFIG) * 1000).toLocaleString("en-ZA")} mm</b>
          <span>Tare (est.)</span>
          <b>{tareKg(DEFAULT_CONFIG).toLocaleString("en-ZA")} kg</b>
          <span>Parts</span>
          <b>
            {Math.max(0, doneCount)} / {parts.length}
          </b>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.ctl}
            aria-pressed={exploded}
            onPointerDown={() => toggleExplode(true)}
            onPointerUp={() => toggleExplode(false)}
            onPointerLeave={() => exploded && toggleExplode(false)}
            onKeyDown={(e) => (e.key === " " || e.key === "Enter") && toggleExplode(!exploded)}
          >
            Hold to explode
          </button>
          {chapter >= 6 && (
            <button
              type="button"
              className={styles.ctl}
              aria-pressed={ramp}
              onClick={() => {
                film.ramp = !ramp;
                setRamp(!ramp);
              }}
            >
              {ramp ? "Close ramp" : "Drop the ramp"}
            </button>
          )}
          {chapter >= 7 && (
            <button
              type="button"
              className={styles.ctl}
              aria-pressed={lights}
              onClick={() => {
                film.lights = !lights;
                setLights(!lights);
              }}
            >
              {lights ? "Lights off" : "Lights on"}
            </button>
          )}
        </div>

        {isEnd && (
          <div className={styles.end}>
            <a className={styles.cta} href="#drive">
              Now tow it →
            </a>
          </div>
        )}

        {/* scale-bar progress */}
        <div className={styles.scale} aria-hidden="true">
          <div className={styles.scaleTrack}>
            <div ref={ruler} className={styles.scaleFill} />
            {CHAPTERS.map((c) => (
              <i key={c.id} style={{ left: `${RANGES[c.id][0] * 100}%` }} />
            ))}
          </div>
          <div className={styles.scaleLabels}>
            <span>0</span>
            <span>Raw steel</span>
            <span>Handover</span>
          </div>
        </div>
      </div>
    </section>
  );
}
