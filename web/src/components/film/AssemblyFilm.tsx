"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { buildTrailer, CHAPTERS, DEFAULT_CONFIG, overallLength, tareKg } from "@/trailer/model";
import { RANGES, chapterAt, film } from "./timeline";
import { DrawingPoster } from "./DrawingPoster";
import { sound } from "@/lib/sound";
import styles from "./film.module.css";

const FilmScene = dynamic(() => import("./FilmScene"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

export default function AssemblyFilm() {
  const section = useRef<HTMLElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const chapterEl = useRef<HTMLDivElement>(null);
  const bomEl = useRef<HTMLOListElement>(null);
  const [chapter, setChapter] = useState(0);
  const [active, setActive] = useState(-1);
  const [ready, setReady] = useState(false);
  const [past, setPast] = useState(false);
  const [inView, setInView] = useState(true);
  const [exploded, setExploded] = useState(false);
  const [lights, setLights] = useState(false);
  const [ramp, setRamp] = useState(false);
  const parts = useMemo(() => buildTrailer(DEFAULT_CONFIG), []);

  useEffect(() => {
    film.label = label.current;
    film.avoid = [chapterEl.current, bomEl.current];
    const onActive = () => setActive(film.active);
    film.listeners.add(onActive);
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        film.p = self.progress;
        const isPast = self.progress > 0.012;
        setPast((prev) => (prev === isPast ? prev : isPast));
        const c = chapterAt(self.progress);
        setChapter((prev) => (prev === c ? prev : c));
        if (ruler.current) ruler.current.style.transform = `scaleX(${self.progress})`;
      },
    });
    // The drawing (poster) is the first frame of the film. Start the 3D only once the visitor
    // engages, so first load stays light on phones and in speed audits.
    const start = () => {
      setReady(true);
      EVENTS.forEach((ev) => window.removeEventListener(ev, start));
    };
    const EVENTS = ["scroll", "wheel", "touchstart", "pointerdown", "keydown", "pointermove"] as const;
    if (window.scrollY > 0) start();
    else EVENTS.forEach((ev) => window.addEventListener(ev, start, { passive: true, once: true }));
    // stop rendering the film while it is off screen
    const io = new IntersectionObserver((es) => setInView(es[0].isIntersecting), { rootMargin: "10% 0px" });
    io.observe(section.current!);
    return () => {
      st.kill();
      EVENTS.forEach((ev) => window.removeEventListener(ev, start));
      io.disconnect();
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
          <DrawingPoster faded={ready && past} />
          {ready && <FilmScene active={inView} />}
        </div>

        {/* headline over the drawing */}
        <div className={`${styles.intro} ${isIntro ? styles.show : ""}`}>
          <h1 className={styles.h1}>
            <span className={styles.h1k}>Custom trailers, built in Cape Town</span>
            Drawn for you.
            <br />
            <em>Built once.</em>
          </h1>
          <p className={styles.lede}>
            Toy haulers, goosenecks, off-road trailers and upgrades, designed around your vehicle, your licence code and your load. Scroll, and watch one being built from the first line to the last weld.
          </p>
          <div className={styles.introCtas}>
            <a className={styles.ctaInk} href="#enquire">
              Get a price
            </a>
            <a className={styles.skip} href="#drive">
              Skip the build ↓
            </a>
          </div>
        </div>

        {/* chapter heading */}
        <div ref={chapterEl} className={`${styles.chapter} ${!isIntro ? styles.show : ""}`} aria-live="polite">
          <span className={styles.chn}>{ch.n}</span>
          <h2 className={styles.cht}>{ch.title}</h2>
          <p className={styles.chl}>{ch.line}</p>
        </div>

        {/* part callout, positioned on the part by the scene */}
        <div ref={label} className={styles.label} style={{ opacity: 0 }}>
          {part && !isIntro && !isEnd && (
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
        <ol ref={bomEl} className={`${styles.bom} ${!isIntro ? styles.show : ""}`} aria-label="Bill of materials">
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

        <div className={styles.controls} hidden={!ready || isIntro}>
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
                sound.hiss();
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
            <a className={styles.cta} href="#enquire">
              Get a price for yours
            </a>
            <a className={styles.ctaGhost} href="#drive">
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
