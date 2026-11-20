"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { KINDS, tareKg, type Kind } from "@/trailer/model";
import { gvmKg } from "@/trailer/pricing";
import { BAKKIE, drive, KIND_LOADS, LOADS, NOSE_BAND, RIG_CFG, type LoadKind, type Readout } from "./driveState";
import type { Surface } from "./road";
import { sound } from "@/lib/sound";
import { towCheck } from "@/content/towrules";
import { track } from "@/lib/track";
import styles from "./drive.module.css";

const DriveScene = dynamic(() => import("./DriveScene"), { ssr: false });

const SURFACES: { id: Surface; label: string; note: string }[] = [
  { id: "tar", label: "Tar", note: "N7 out of Cape Town" },
  { id: "gravel", label: "Corrugations", note: "R355 to the Tankwa" },
  { id: "rocks", label: "Rocks", note: "Axle-twisters and boulders" },
];
const WHEEL_NAMES = ["Front left", "Front right", "Rear left", "Rear right"];

export default function TestDrive() {
  const root = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  const [surface, setSurface] = useState<Surface>(drive.surface);
  const [kind, setKind] = useState<Kind>(drive.kind);
  const TARE = tareKg(RIG_CFG[kind]);
  const GVM = gvmKg(RIG_CFG[kind]);
  const band = NOSE_BAND[kind];
  const [kmh, setKmh] = useState(drive.targetKmh);
  const [view, setView] = useState(drive.view);
  const [strapped, setStrapped] = useState(drive.strapped);
  const [water, setWater] = useState(drive.water);
  const [loads, setLoads] = useState(drive.loads);
  const [r, setR] = useState<Readout>(drive.readout);
  const [resetKey, setResetKey] = useState(drive.resetKey);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const io = new IntersectionObserver((es) => es[0].isIntersecting && setMounted(true), { rootMargin: "120% 0px" });
    io.observe(root.current!);
    const vis = new IntersectionObserver((es) => setInView(es[0].isIntersecting), { rootMargin: "0px" });
    vis.observe(root.current!);
    const f = () => {
      setR(drive.readout);
      const t = drive.readout.travel;
      // how hard the suspension is working, for the stone-and-corrugation noise
      const spread = Math.max(...t) - Math.min(...t);
      sound.road(drive.readout.kmh, Math.min(1, spread / 60), drive.surface);
      setResetKey(drive.resetKey);
      setNotice(drive.notice);
    };
    drive.listeners.add(f);
    return () => {
      io.disconnect();
      vis.disconnect();
      drive.listeners.delete(f);
    };
  }, []);

  // quiet the road when the rig scrolls away
  useEffect(() => {
    if (!inView) sound.road(0, 0, "tar");
  }, [inView]);

  const addLoad = (kind: LoadKind) => {
    const max = kind === "quad" ? 1 : kind === "bike" ? 2 : 6;
    if (drive.loads.filter((l) => l.kind === kind).length >= max) return;
    drive.loads = [...drive.loads, { id: drive.nextId++, kind }];
    setLoads(drive.loads);
    drive.emit();
  };
  const clear = () => {
    drive.loads = [];
    drive.water = false;
    setLoads([]);
    setWater(false);
    drive.emit();
  };

  const payload = r.gross - TARE;
  const over = r.gross > GVM;
  const nosePct = r.gross > 0 ? (r.noseKg / r.gross) * 100 : 0;
  const noseOk = !r.ready || (nosePct >= band.lo && nosePct <= band.hi);
  const combo = BAKKIE.gvm + GVM;
  // the same rules the tow checker uses, for this example bakkie and trailer
  const rules = towCheck({ vehicle: "bakkie", tare: BAKKIE.tare, gvm: BAKKIE.gvm, trailerGvm: GVM, towRating: BAKKIE.towRating, gcm: BAKKIE.gcm });
  const live = r.liveNoseKg;

  return (
    <section ref={root} id="drive" className={styles.drive} aria-labelledby="drive-title">
      <header className={styles.head}>
        <p className={styles.eyebrow}>Test rig · real physics</p>
        <h2 id="drive-title" className={styles.title}>
          Now tow it.
        </h2>
        <p className={styles.lede}>
          Hitch the trailer to a bakkie and take it down the road. Change the surface, load it up and watch each wheel work. The numbers are worked out live from the forces in the simulation.
        </p>
      </header>

      <div className={styles.rig}>
        <div className={styles.viewport}>
          {mounted ? <DriveScene surface={surface} active={inView} resetKey={resetKey} kind={kind} /> : <div className={styles.placeholder}>Loading the test rig…</div>}
          <div className={styles.views} role="group" aria-label="Camera">
            {(["chase", "wheel", "side"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => {
                  drive.view = v;
                  setView(v);
                }}
              >
                {v === "chase" ? "Chase" : v === "wheel" ? "Wheel" : "Side"}
              </button>
            ))}
          </div>
          <p className={styles.hint}>Drag to look around</p>
          <div className={styles.hud} aria-hidden="true">
            <span>
              <b>{r.kmh}</b> km/h
            </span>
            <span>
              Nose <b>{r.ready ? `${r.noseKg} kg` : "…"}</b>
            </span>
            <span className={styles.hudBars}>
              {r.travel.map((mm, i) => (
                <i key={i} style={{ transform: `scaleY(${Math.max(0.04, Math.min(1, (mm + 120) / 250))})` }} />
              ))}
            </span>
          </div>
          {(notice || (r.loose ?? 0) > 0 || (r.shifted ?? 0) > 0) && (
            <p className={styles.notice} role="status">
              {(r.loose ?? 0) > 0
                ? `${r.loose === 1 ? "A load has" : `${r.loose} loads have`} come off the deck. Strap it down, or unload.`
                : (r.shifted ?? 0) > 0
                  ? `${r.shifted === 1 ? "A load has" : `${r.shifted} loads have`} shifted on the deck. Straps on keeps them where you put them.`
                  : notice}
            </p>
          )}
        </div>

        <aside className={styles.panel} aria-label="Test rig controls and readouts">
          <fieldset className={styles.group}>
            <legend>Trailer</legend>
            <div className={styles.seg}>
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  aria-pressed={kind === k.id}
                  onClick={() => {
                    drive.kind = k.id;
                    drive.loads = [];
                    drive.water = false;
                    setLoads([]);
                    setWater(false);
                    setKind(k.id);
                    drive.reset("");
                  }}
                >
                  <b>{k.short}</b>
                  <small>{k.id === "gooseneck" ? "hitched in the load bed" : k.id === "offroad" ? "3.0 m camper" : "4.8 m tandem"}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend>Road</legend>
            <div className={styles.seg}>
              {SURFACES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={surface === s.id}
                  onClick={() => {
                    drive.surface = s.id;
                    setSurface(s.id);
                  }}
                >
                  <b>{s.label}</b>
                  <small>{s.note}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <div className={styles.group}>
            <label htmlFor="speed" className={styles.legend}>
              Speed <output htmlFor="speed">{kmh} km/h</output>
            </label>
            <input
              id="speed"
              type="range"
              min={0}
              max={120}
              step={5}
              value={kmh}
              onChange={(e) => {
                drive.targetKmh = +e.target.value;
                setKmh(+e.target.value);
              }}
            />
            {kmh === 0 && (
              <button
                type="button"
                className={styles.go}
                onClick={() => {
                  drive.targetKmh = 40;
                  setKmh(40);
                  track("rig_driven", { surface });
                }}
              >
                Set off at 40 km/h
              </button>
            )}
            {kmh > 100 && combo > 3500 && (
              <p className={styles.warn}>
                Over the limit for this combination: {rules.speed.limit}. {rules.speed.why}
              </p>
            )}
          </div>

          <fieldset className={styles.group}>
            <legend>Load it</legend>
            <div className={styles.loads}>
              {KIND_LOADS[kind].map((k: LoadKind) => (
                <button key={k} type="button" onClick={() => addLoad(k)}>
                  + {LOADS[k].label} <small>{LOADS[k].kg} kg</small>
                </button>
              ))}
              <button
                type="button"
                aria-pressed={water}
                onClick={() => {
                  drive.water = !water;
                  setWater(!water);
                  drive.emit();
                }}
              >
                {water ? "Drain water" : "Fill water tank"} <small>80 kg</small>
              </button>
            </div>
            <div className={styles.row}>
              <button
                type="button"
                aria-pressed={strapped}
                className={styles.strap}
                onClick={() => {
                  drive.strapped = !strapped;
                  setStrapped(!strapped);
                  drive.emit();
                }}
              >
                {strapped ? "Straps on" : "Straps off"}
              </button>
              <button type="button" className={styles.clear} onClick={clear} disabled={!loads.length && !water}>
                Unload
              </button>
              <button type="button" className={styles.clear} onClick={() => drive.reset("")}>
                Reset rig
              </button>
            </div>
          </fieldset>

          <div className={styles.readouts} aria-live="off">
            <div className={styles.stat}>
              <span>Speed</span>
              <b>{r.kmh}</b>
              <i>km/h</i>
            </div>
            <div className={styles.stat}>
              <span>Floor g, peak</span>
              <b>{r.g.toFixed(2)}</b>
              <i>g</i>
            </div>
            <div className={styles.stat}>
              <span>Pitch / roll</span>
              <b>
                {r.pitch.toFixed(1)}° / {r.roll.toFixed(1)}°
              </b>
            </div>

            <div className={styles.travel} aria-label="Suspension compression per wheel">
              <span className={styles.small}>Suspension travel</span>
              {r.travel.map((mm, i) => (
                <div key={i} className={styles.bar} title={WHEEL_NAMES[i]}>
                  <i style={{ transform: `scaleY(${Math.max(0, Math.min(1, (mm + 120) / 250))})` }} />
                  <em>{mm}</em>
                </div>
              ))}
              <span className={styles.unit}>mm, + = compressed</span>
            </div>

            <div className={`${styles.meter} ${noseOk ? "" : styles.bad}`}>
              <span>Nose weight on the tow ball</span>
              <b>
                {r.ready ? (
                  <>
                    {r.noseKg} kg <small>({nosePct.toFixed(1)}%)</small>
                  </>
                ) : (
                  "Weighing…"
                )}
              </b>
              <div className={styles.track}>
                <i className={styles.band} style={{ left: `${(band.lo / band.max) * 100}%`, width: `${((band.hi - band.lo) / band.max) * 100}%` }} />
                <i className={styles.needle} style={{ left: `${Math.max(0, Math.min(100, (nosePct / band.max) * 100))}%` }} />
              </div>
              <small>
                Parked, level: worked out from where the mass sits. Live hitch load on this road: {live >= 0 ? `${live} kg` : `${-live} kg lifting`}. {band.note}
              </small>
            </div>

            <div className={`${styles.meter} ${over ? styles.bad : ""}`}>
              <span>Mass vs GVM</span>
              <b>
                {r.gross.toLocaleString("en-ZA")} / {GVM.toLocaleString("en-ZA")} kg
              </b>
              <div className={styles.track}>
                <i className={styles.fill} style={{ width: `${Math.min(100, (r.gross / GVM) * 100)}%` }} />
              </div>
              <small>
                Tare {TARE.toLocaleString("en-ZA")} kg + payload {payload.toLocaleString("en-ZA")} kg. {over ? "Over GVM: not roadworthy." : `${(GVM - r.gross).toLocaleString("en-ZA")} kg to spare.`}
              </small>
            </div>

            <dl className={styles.legal}>
              <div>
                <dt>Licence</dt>
                <dd>
                  Code {rules.licence.code}. {rules.licence.why}
                </dd>
              </div>
              <div>
                <dt>Brakes</dt>
                <dd>
                  {rules.brakes.need}. {rules.brakes.why} Fitted on this example: {rules.brakes.need.includes("driver") ? "electric disc brakes with an in-cab controller" : "overrun disc brakes"}.
                </dd>
              </div>
              <div>
                <dt>Speed</dt>
                <dd>
                  {rules.speed.limit}. {rules.speed.why}
                </dd>
              </div>
              <div>
                <dt>Tow vehicle</dt>
                <dd>
                  {BAKKIE.name}: tare {BAKKIE.tare.toLocaleString("en-ZA").replace(/,/g, " ")} kg, GVM {BAKKIE.gvm.toLocaleString("en-ZA").replace(/,/g, " ")} kg, rated{" "}
                  {BAKKIE.towRating.toLocaleString("en-ZA").replace(/,/g, " ")} kg braked
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
      <p className={styles.foot}>Example build and example tow vehicle. Your trailer is engineered and weighed for your own bakkie and licence.</p>
    </section>
  );
}
