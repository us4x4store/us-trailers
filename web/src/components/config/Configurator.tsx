"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { TrailerConfig } from "@/trailer/model";
import {
  COLOURS,
  LENGTHS,
  decodeBuild,
  encodeBuild,
  priceRange,
  rand,
  specs,
} from "@/trailer/pricing";
import { buildStore } from "./buildStore";
import styles from "./config.module.css";

const ConfigScene = dynamic(() => import("./ConfigScene"), { ssr: false });

export default function Configurator() {
  const root = useRef<HTMLElement>(null);
  const [cfg, setCfg] = useState<TrailerConfig>(buildStore.cfg);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  const [copied, setCopied] = useState(false);

  // open a shared build from ?build=L48-A2-C0-R1-S1
  useEffect(() => {
    const shared = decodeBuild(
      new URLSearchParams(location.search).get("build"),
    );
    if (shared) {
      buildStore.set(shared);
      setCfg(shared);
    }
    const near = new IntersectionObserver(
      (es) => es[0].isIntersecting && setMounted(true),
      { rootMargin: "100% 0px" },
    );
    const vis = new IntersectionObserver((es) =>
      setInView(es[0].isIntersecting),
    );
    near.observe(root.current!);
    vis.observe(root.current!);
    return () => {
      near.disconnect();
      vis.disconnect();
    };
  }, []);

  const update = (patch: Partial<TrailerConfig>) => {
    let next = { ...cfg, ...patch };
    // long bodies need two axles; short bodies can choose
    if (next.length > 4.2 && next.axles === 1 && !("axles" in patch))
      next = { ...next, axles: 2 };
    setCfg(next);
    buildStore.set(next);
    setCopied(false);
  };

  const s = specs(cfg);
  const [lo, hi] = priceRange(cfg);
  const code = encodeBuild(cfg);

  const share = async () => {
    const url = `${location.origin}${location.pathname}?build=${code}#design`;
    try {
      if (navigator.share)
        await navigator.share({ title: "My US Trailers build", url });
      else await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      /* user cancelled */
    }
  };

  return (
    <section
      ref={root}
      id="design"
      className={styles.cfg}
      aria-labelledby="design-title"
    >
      <header className={styles.head}>
        <p className={styles.eyebrow}>Design yours</p>
        <h2 id="design-title" className={styles.title}>
          Draw your own.
        </h2>
        <p className={styles.lede}>
          Set the length, the axles, the colour and the kit. The drawing, the
          weights and the price move with you. Send it to us and it becomes the
          first page of your brief.
        </p>
      </header>

      <div className={styles.board}>
        <div className={styles.view}>
          {mounted ? (
            <ConfigScene cfg={cfg} active={inView} />
          ) : (
            <div className={styles.wait}>Setting up the drawing board…</div>
          )}
          <div className={styles.code} aria-label="Build code">
            <span>Build</span>
            <b>{code}</b>
            <button type="button" className={styles.codeShare} onClick={share}>
              {copied ? "Copied" : "Share"}
            </button>
          </div>
        </div>

        <div className={styles.panel}>
          <fieldset className={styles.field}>
            <legend>Body length</legend>
            <div className={styles.seg}>
              {LENGTHS.map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={cfg.length === l}
                  onClick={() => update({ length: l })}
                >
                  {(l * 1000).toLocaleString("en-ZA").replace(/,/g, " ")}
                  <small>mm</small>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.field}>
            <legend>Axles</legend>
            <div className={styles.seg}>
              <button
                type="button"
                aria-pressed={cfg.axles === 1}
                disabled={cfg.length > 4.2}
                onClick={() => update({ axles: 1 })}
              >
                Single<small>up to 4 200 mm</small>
              </button>
              <button
                type="button"
                aria-pressed={cfg.axles === 2}
                onClick={() => update({ axles: 2 })}
              >
                Tandem<small>more payload, more stable</small>
              </button>
            </div>
          </fieldset>

          <fieldset className={styles.field}>
            <legend>
              Colour{" "}
              <span className={styles.pick}>
                {COLOURS.find((c) => c.hex === cfg.colour)?.name}
              </span>
            </legend>
            <div className={styles.swatches}>
              {COLOURS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  aria-label={c.name}
                  aria-pressed={cfg.colour === c.hex}
                  style={{ background: c.hex }}
                  onClick={() => update({ colour: c.hex })}
                />
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.field}>
            <legend>Kit</legend>
            <div className={styles.toggles}>
              <button
                type="button"
                aria-pressed={cfg.rack}
                onClick={() => update({ rack: !cfg.rack })}
              >
                Roof rack<small>150 kg, bolted to the frame</small>
              </button>
              <button
                type="button"
                aria-pressed={cfg.solar}
                onClick={() => update({ solar: !cfg.solar })}
              >
                200 W solar<small>MPPT, lithium-ready</small>
              </button>
            </div>
          </fieldset>

          <dl className={styles.specs}>
            <div>
              <dt>Overall</dt>
              <dd>
                {s.overallMm.toLocaleString("en-ZA").replace(/,/g, " ")} mm
              </dd>
            </div>
            <div>
              <dt>Tare / GVM</dt>
              <dd>
                {s.tare.toLocaleString("en-ZA").replace(/,/g, " ")} /{" "}
                {s.gvm.toLocaleString("en-ZA").replace(/,/g, " ")} kg
              </dd>
            </div>
            <div>
              <dt>Payload</dt>
              <dd>{s.payload.toLocaleString("en-ZA").replace(/,/g, " ")} kg</dd>
            </div>
            <div>
              <dt>Licence</dt>
              <dd>Code {s.licence}</dd>
            </div>
            <div>
              <dt>Brakes</dt>
              <dd>{s.brakes}</dd>
            </div>
          </dl>

          <div className={styles.dock}>
            <div className={styles.price}>
              <span>Indicative price</span>
              <b>
                {rand(lo)} – {rand(hi)}
              </b>
              <small>
                Example pricing, incl. VAT. Your final price comes with your
                drawing.
              </small>
            </div>

            <div className={styles.actions}>
              <a className={styles.send} href="#enquire">
                Send this build
              </a>
              <button type="button" className={styles.share} onClick={share}>
                {copied ? "Link copied" : "Share"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
