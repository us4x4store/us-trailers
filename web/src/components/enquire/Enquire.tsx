"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { sendEnquiry, type EnquiryState } from "@/app/actions/enquire";
import { buildStore } from "@/components/config/buildStore";
import { COLOURS, encodeBuild, priceRange, rand, specs } from "@/trailer/pricing";
import { track } from "@/lib/track";
import styles from "./enquire.module.css";

const USES = ["Bikes or quads", "Overlanding / camping", "Horses", "Mobile business", "Farm or contracting", "Something else"];

export default function Enquire() {
  const [state, action, pending] = useActionState<EnquiryState, FormData>(sendEnquiry, { status: "idle" });
  const [cfg, setCfg] = useState(buildStore.cfg);
  const [touched, setTouched] = useState(buildStore.touched);
  const [attach, setAttach] = useState(true);
  const [t, setT] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setT(Date.now());
    const f = () => {
      setCfg(buildStore.cfg);
      setTouched(buildStore.touched);
    };
    buildStore.listeners.add(f);
    f(); // a shared ?build= link may have loaded before we subscribed
    return () => {
      buildStore.listeners.delete(f);
    };
  }, []);

  const s = specs(cfg);
  const [lo, hi] = priceRange(cfg);
  const [local, setLocal] = useState<Record<string, string> | null>(null);
  const errors = local ?? state.errors ?? {};
  const err = (k: string) => errors[k];
  const v = (k: string) => state.values?.[k] ?? "";
  const formRef = useRef<HTMLFormElement>(null);
  const moreOpen = !!(state.values && ["email", "town", "licence", "use", "timeline", "message"].some((k) => state.values?.[k])) || !!err("email");

  // check in the browser first; the server checks again
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const f = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (String(f.get("name") ?? "").trim().length < 2) next.name = "Tell us your name.";
    if (!/^[+\d][\d\s()-]{8,18}$/.test(String(f.get("phone") ?? "").trim())) next.phone = "Add a phone or WhatsApp number we can reach you on, e.g. 082 123 4567.";
    const em = String(f.get("email") ?? "").trim();
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) next.email = "That email address doesn't look complete.";
    if (f.get("consent") !== "on") next.consent = "Please agree so we can contact you about your trailer.";
    if (Object.keys(next).length) {
      e.preventDefault();
      setLocal(next);
      return;
    }
    setLocal(null);
  };

  useEffect(() => {
    if (state.status === "sent" || state.status === "offline") track("enquiry_submitted", { status: state.status, attached: attach });
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  // move focus to the first problem, whichever side found it
  useEffect(() => {
    const first = ["name", "phone", "email", "consent"].find((k) => errors[k]);
    if (!first) return;
    if (first === "email" && formRef.current) formRef.current.querySelector("details")?.setAttribute("open", "");
    document.getElementById(first)?.focus();
  }, [local, state]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state.status === "sent")
    return (
      <section id="enquire" className={styles.enq}>
        <div className={styles.done} role="status" tabIndex={-1} ref={(el) => el?.focus()}>
          <p className={styles.eyebrow}>Brief received</p>
          <h2 className={styles.title}>Your drawing is on our desk.</h2>
          <p className={styles.lede}>We read every brief ourselves and reply within one working day, usually by WhatsApp. Keep your build code handy: {encodeBuild(cfg)}.</p>
        </div>
      </section>
    );

  return (
    <section id="enquire" className={styles.enq} aria-labelledby="enq-title">
      <header className={styles.head}>
        <p className={styles.eyebrow}>Start your drawing</p>
        <h2 id="enq-title" className={styles.title}>
          Tell us what you tow.
        </h2>
        <p className={styles.lede}>Two minutes now saves a week of back-and-forth. We&apos;ll come back with questions, a first sketch and an honest price.</p>
      </header>

      <form ref={formRef} action={action} onSubmit={onSubmit} className={styles.form} noValidate>
        <input type="hidden" name="t" value={t} />
        <div className={styles.trap} aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" tabIndex={-1} autoComplete="off" />
        </div>

        <div className={styles.grid}>
          <Field id="name" label="Your name" error={err("name")}>
            <input id="name" name="name" autoComplete="name" required defaultValue={v("name")} aria-invalid={!!err("name")} aria-describedby={err("name") ? "name-err" : undefined} />
          </Field>
          <Field id="phone" label="Phone or WhatsApp" error={err("phone")} hint="We reply on WhatsApp unless you say otherwise.">
            <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required defaultValue={v("phone")} aria-invalid={!!err("phone")} aria-describedby={err("phone") ? "phone-err" : undefined} />
          </Field>
          <Field id="vehicle" label="What will tow it?" wide hint="Make, model and year. We match the drawbar, wiring and wheels to it.">
            <input id="vehicle" name="vehicle" defaultValue={v("vehicle")} />
          </Field>
        </div>

        <details className={styles.more} open={moreOpen}>
          <summary>Add more detail (optional)</summary>
          <div className={styles.grid}>
            <Field id="email" label="Email" error={err("email")}>
              <input id="email" name="email" type="email" autoComplete="email" defaultValue={v("email")} aria-invalid={!!err("email")} aria-describedby={err("email") ? "email-err" : undefined} />
            </Field>
            <Field id="town" label="Town">
              <input id="town" name="town" autoComplete="address-level2" defaultValue={v("town")} />
            </Field>
            <Field id="licence" label="Your licence code">
              <select id="licence" name="licence" key={`licence-${v("licence")}`} defaultValue={v("licence")}>
                <option value="">Choose…</option>
                <option>B</option>
                <option>EB</option>
                <option>C1/EC1</option>
                <option>Not sure</option>
              </select>
            </Field>
            <Field id="use" label="Mainly for">
              <select id="use" name="use" key={`use-${v("use")}`} defaultValue={v("use")}>
                <option value="">Choose…</option>
                {USES.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </Field>
            <Field id="timeline" label="When do you need it?">
              <select id="timeline" name="timeline" key={`timeline-${v("timeline")}`} defaultValue={v("timeline")}>
                <option value="">Choose…</option>
                <option>As soon as possible</option>
                <option>Within 3 months</option>
                <option>Within 6 months</option>
                <option>Just planning</option>
              </select>
            </Field>
            <Field id="message" label="Anything else?" wide hint="What you carry, where you go, what has gone wrong with trailers before.">
              <textarea id="message" name="message" rows={4} defaultValue={v("message")} />
            </Field>
          </div>
        </details>

        <div className={styles.build}>
          <label className={styles.check}>
            <input type="checkbox" checked={attach} onChange={(e) => setAttach(e.target.checked)} />
            <span>Attach my build{touched ? "" : " (the example on this page)"}</span>
          </label>
          {attach && (
            <div className={styles.sheet}>
              <input type="hidden" name="build" value={encodeBuild(cfg)} />
              <span>{encodeBuild(cfg)}</span>
              <span>
                {s.bodyMm.toLocaleString("en-ZA").replace(/,/g, " ")} mm body · {cfg.axles === 2 ? "tandem" : "single"} axle · {COLOURS.find((c) => c.hex === cfg.colour)?.name}
                {cfg.rack ? " · rack" : ""}
                {cfg.solar ? " · solar" : ""}
              </span>
              <span>
                {rand(lo)} – {rand(hi)} example price
              </span>
              <a href="#design">Change it</a>
            </div>
          )}
        </div>

        <label className={styles.check}>
          <input id="consent" type="checkbox" name="consent" defaultChecked={v("consent") === "on"} aria-invalid={!!err("consent")} aria-describedby={err("consent") ? "consent-err" : undefined} />
          <span>
            US Trailers may contact me about this enquiry. We keep your details only for your build and never share them. <a href="/privacy">Privacy notice (POPIA)</a>.
          </span>
        </label>
        {err("consent") && (
          <p className={styles.error} id="consent-err">
            {err("consent")}
          </p>
        )}

        {state.status === "offline" && (
          <div className={styles.offline} role="alert">
            <p>Your brief is ready, but our online inbox isn&apos;t connected yet, so it hasn&apos;t been sent. Copy it and keep it: you&apos;ll be able to send it as soon as we go live.</p>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(state.summary ?? "");
                  setCopied(true);
                } catch {
                  /* clipboard refused */
                }
              }}
            >
              {copied ? "Copied" : "Copy my brief"}
            </button>
          </div>
        )}

        <button className={styles.submit} type="submit" disabled={pending}>
          {pending ? "Sending your brief…" : "Send my brief"}
        </button>
      </form>
    </section>
  );
}

function Field({ id, label, error, hint, wide, children }: { id: string; label: string; error?: string; hint?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={`${styles.field} ${wide ? styles.wide : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p className={styles.error} id={`${id}-err`}>
          {error}
        </p>
      ) : hint ? (
        <p className={styles.hint} id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
