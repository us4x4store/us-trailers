"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/track";
import { fmt, towCheck, type TowInput } from "@/content/towrules";
import styles from "./towcheck.module.css";

type Field = "tare" | "gvm" | "trailerGvm" | "towRating" | "gcm";
const FIELDS: { k: Field; label: string; hint: string; optional?: boolean }[] = [
  { k: "tare", label: "Vehicle tare", hint: "On your vehicle's licence disc." },
  { k: "gvm", label: "Vehicle GVM", hint: "Also on the licence disc." },
  { k: "trailerGvm", label: "Trailer GVM", hint: "On the trailer's disc or plate. For a new build, we'll tell you." },
  { k: "towRating", label: "Braked towing capacity", hint: "From the owner's manual.", optional: true },
  { k: "gcm", label: "Vehicle GCM", hint: "Gross combination mass, from the owner's manual.", optional: true },
];
/** example double-cab bakkie */
const START: Record<Field, string> = { tare: "2100", gvm: "3210", trailerGvm: "1500", towRating: "3500", gcm: "5850" };

/** "Can I tow it?": licence code, brakes and speed limit from the numbers on two licence discs. */
export default function TowCheck({ id = "tow-check" }: { id?: string }) {
  const [vehicle, setVehicle] = useState<TowInput["vehicle"]>("bakkie");
  const [raw, setRaw] = useState(START);
  const n = (k: Field) => (raw[k].trim() === "" ? NaN : Number(raw[k]));
  const missing = FIELDS.filter((f) => !f.optional && !(n(f.k) > 0)).map((f) => f.label.toLowerCase());
  const r =
    missing.length === 0
      ? towCheck({ vehicle, tare: n("tare"), gvm: n("gvm"), trailerGvm: n("trailerGvm"), towRating: n("towRating") > 0 ? n("towRating") : undefined, gcm: n("gcm") > 0 ? n("gcm") : undefined })
      : null;

  // one event per visitor who actually uses it, after they stop typing
  const sent = useRef(false);
  const touched = useRef(false);
  useEffect(() => {
    if (!touched.current || sent.current || !r) return;
    const t = setTimeout(() => {
      sent.current = true;
      track("tow_check", { licence: r.licence.code, vehicle });
    }, 2500);
    return () => clearTimeout(t);
  }, [raw, vehicle]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section id={id} className={styles.tc} onInput={() => (touched.current = true)} onClick={() => (touched.current = true)} aria-labelledby={`${id}-title`}>
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
                <button key={v} type="button" aria-pressed={vehicle === v} onClick={() => setVehicle(v)}>
                  {v === "bakkie" ? "A bakkie" : "A car or SUV"}
                </button>
              ))}
            </div>
          </fieldset>
          {FIELDS.map((f) => (
            <div className={styles.field} key={f.k}>
              <label htmlFor={`${id}-${f.k}`}>{f.label}</label>
              <div className={styles.unit}>
                <input
                  id={`${id}-${f.k}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={10}
                  value={raw[f.k]}
                  placeholder={f.optional ? "optional" : "e.g. 2 100"}
                  onChange={(e) => setRaw({ ...raw, [f.k]: e.target.value })}
                />
                <span>kg</span>
              </div>
              <p className={styles.hint}>{f.hint}</p>
            </div>
          ))}
          <div className={styles.presets}>
            <span>Try a trailer:</span>
            {[750, 1500, 3000].map((kg) => (
              <button key={kg} type="button" onClick={() => setRaw({ ...raw, trailerGvm: String(kg) })}>
                {fmt(kg)} kg
              </button>
            ))}
          </div>
        </div>

        <div className={styles.out} aria-live="polite">
          {!r ? (
            <div className={styles.res}>
              <span className={styles.k}>Waiting for numbers</span>
              <p>Add the {missing.join(", ")} to see your answer.</p>
            </div>
          ) : (
            <>
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
                {vehicle === "bakkie" ? "Bakkie" : "Vehicle"} {fmt(n("gvm"))} kg + trailer {fmt(n("trailerGvm"))} kg = <b>{fmt(n("gvm") + n("trailerGvm"))} kg</b> combined GVM
              </p>
              {r.licence.code === "EB" && (
                <a className={styles.cta} href="/#enquire">
                  Only have code B? Ask us for a 750 kg build
                </a>
              )}
            </>
          )}
        </div>

        {/* phones: the answer stays in view while you type */}
        <div className={styles.dock} aria-hidden="true">
          {r ? (
            <>
              <span>
                <i>Licence</i>
                <b>{r.licence.code}</b>
              </span>
              <span>
                <i>Brakes</i>
                <b>{r.brakes.need.includes("driver") ? "Electric" : r.brakes.need.includes("overrun") ? "Overrun" : r.brakes.need.includes("service") ? "Service" : "Parking"}</b>
              </span>
              <span>
                <i>Speed</i>
                <b>{r.speed.limit.split(",")[0]}</b>
              </span>
            </>
          ) : (
            <span>
              <i>Add your numbers</i>
            </span>
          )}
        </div>
      </div>
      <p className={styles.note}>From the National Road Traffic Regulations (reg 99, 151, 292–293). Guidance, not legal advice.</p>
    </section>
  );
}
