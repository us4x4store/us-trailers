"use client";

import { useState } from "react";
import { fmt, towCheck, type TowInput } from "@/content/towrules";
import styles from "./towcheck.module.css";

const START: TowInput = { vehicle: "bakkie", tare: 2100, gvm: 3210, trailerGvm: 1500, towRating: 3500 };

/** "Can I tow it?": licence code, brakes and speed limit from the numbers on two licence discs. */
export default function TowCheck({ id = "tow-check" }: { id?: string }) {
  const [i, setI] = useState<TowInput>(START);
  const r = towCheck(i);
  const set = (patch: Partial<TowInput>) => setI({ ...i, ...patch });
  const num = (k: keyof TowInput, label: string, hint: string, optional = false) => (
    <div className={styles.field}>
      <label htmlFor={`${id}-${k}`}>{label}</label>
      <div className={styles.unit}>
        <input
          id={`${id}-${k}`}
          type="number"
          inputMode="numeric"
          min={0}
          step={10}
          value={(i[k] as number | undefined) ?? ""}
          placeholder={optional ? "optional" : undefined}
          onChange={(e) => set({ [k]: e.target.value === "" ? (optional ? undefined : 0) : +e.target.value } as Partial<TowInput>)}
        />
        <span>kg</span>
      </div>
      <p className={styles.hint}>{hint}</p>
    </div>
  );

  return (
    <section id={id} className={styles.tc} aria-labelledby={`${id}-title`}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>Calculation sheet</p>
        <h2 id={`${id}-title`} className={styles.title}>
          Can I tow it?
        </h2>
        <p className={styles.lede}>Copy three numbers from your licence discs. You&apos;ll see the licence code you need, the brakes the trailer must have and your speed limit.</p>
      </header>

      <div className={styles.sheet}>
        <div className={styles.inputs}>
          <fieldset className={styles.seg}>
            <legend>Towing with</legend>
            <div>
              {(["bakkie", "car"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={i.vehicle === v} onClick={() => set({ vehicle: v })}>
                  {v === "bakkie" ? "A bakkie" : "A car or SUV"}
                </button>
              ))}
            </div>
          </fieldset>
          {num("tare", "Vehicle tare", "On your vehicle's licence disc.")}
          {num("gvm", "Vehicle GVM", "Also on the licence disc.")}
          {num("trailerGvm", "Trailer GVM", "On the trailer's disc or plate. For a new build, we'll tell you.")}
          {num("towRating", "Braked towing capacity", "From the owner's manual.", true)}
          <div className={styles.presets}>
            <span>Try:</span>
            <button type="button" onClick={() => set({ trailerGvm: 750 })}>
              750 kg build
            </button>
            <button type="button" onClick={() => set({ trailerGvm: 1500 })}>
              1 500 kg camper
            </button>
            <button type="button" onClick={() => set({ trailerGvm: 3000 })}>
              3 000 kg toy hauler
            </button>
          </div>
        </div>

        <div className={styles.out} aria-live="polite">
          <div className={styles.res}>
            <span className={styles.k}>Licence</span>
            <b className={styles.code}>{r.licence.code}</b>
            <p>{r.licence.why}</p>
          </div>
          <div className={styles.res}>
            <span className={styles.k}>Brakes</span>
            <b className={styles.val}>{r.brakes.need}</b>
            <p>{r.brakes.why}</p>
          </div>
          <div className={styles.res}>
            <span className={styles.k}>Speed limit</span>
            <div className={styles.speed}>
              {r.speed.sign && (
                <svg viewBox="0 0 40 40" aria-hidden="true" className={styles.sign}>
                  <circle cx="20" cy="20" r="18" fill="#fff" stroke="#B8352A" strokeWidth="4" />
                  <text x="20" y="25" textAnchor="middle" fontSize="13" fontWeight="700" fill="#22262A" fontFamily="var(--display), sans-serif">
                    100
                  </text>
                </svg>
              )}
              <b className={styles.val}>{r.speed.limit}</b>
            </div>
            <p>{r.speed.why}</p>
          </div>
          {r.warnings.map((w) => (
            <p key={w} className={styles.warn} role="alert">
              {w}
            </p>
          ))}
          <p className={styles.sum}>
            {i.vehicle === "bakkie" ? "Bakkie" : "Vehicle"} {fmt(i.gvm)} kg + trailer {fmt(i.trailerGvm)} kg = <b>{fmt(i.gvm + i.trailerGvm)} kg</b> combined GVM
          </p>
          {r.licence.code !== "B" && i.trailerGvm > 750 && (
            <a className={styles.cta} href="/#enquire">
              Only have code B? Ask us for a 750 kg build
            </a>
          )}
        </div>
      </div>
      <p className={styles.note}>From the National Road Traffic Regulations (reg 99, 151, 292–293). Guidance, not legal advice.</p>
    </section>
  );
}
