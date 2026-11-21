import type { Metadata } from "next";
import Link from "next/link";
import FaqList from "@/components/faq/FaqList";
import { STAGES } from "@/content/process";
import t from "@/components/types/type.module.css";
import s from "@/components/pages/pages.module.css";

export const metadata: Metadata = {
  title: "How a custom trailer build works, from first call to handover | US Trailers",
  description: "The bespoke trailer process in nine steps: first call, measuring, your drawing and fixed price, chassis, running gear, fit-out, weighbridge and road test, registration and handover. About 12 weeks.",
  alternates: { canonical: "/how-it-works" },
};

/* EXAMPLE terms until Justin confirms deposit, payments and warranty (questions batch 1, Q5–Q7) */
const HANDOVER = [
  "Your scaled drawing, signed off, with every dimension and weight on it",
  "Weighbridge slip showing the tare, and the information plate on the drawbar",
  "Registered on NaTIS, with a licence disc and roadworthy certificate",
  "Brake and road test results",
  "A wiring diagram labelled to match the harness",
  "A walk-through: hitching, reversing, loading and strapping",
  "Your first service booked",
];

export default function HowItWorks() {
  const weeks = STAGES[STAGES.length - 1].week;
  return (
    <main id="main" className={t.page}>
      <nav className={t.crumbs} aria-label="Breadcrumb">
        <Link href="/">US Trailers</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">How it works</span>
      </nav>
      <header className={t.hero}>
        <div className={t.copy}>
          <p className={t.eyebrow}>The process · about {weeks} weeks</p>
          <h1 className={t.h1}>Drawn first. Then built once.</h1>
          <p className={t.lede}>Nothing is cut until you&apos;ve signed the drawing. You see the dimensions, the weights, the licence you&apos;ll need and a fixed price before you pay a cent.</p>
          <div className={t.ctas}>
            <Link className={t.primary} href="/contact">
              Start with a call
            </Link>
            <Link className={t.secondary} href="/builds">
              See example builds
            </Link>
          </div>
        </div>
        <div className={s.facts} role="group" aria-label="The process in numbers">
          <div className={s.fact}>
            <b>{weeks}</b>
            <span>Weeks, call to handover</span>
          </div>
          <div className={s.fact}>
            <b>{STAGES.length}</b>
            <span>Steps</span>
          </div>
          <div className={s.fact}>
            <b>1</b>
            <span>Fixed price, on the drawing</span>
          </div>
          <div className={s.fact}>
            <b>0</b>
            <span>Steel cut before you sign</span>
          </div>
        </div>
      </header>

      <ol className={s.steps} aria-label="From first call to handover">
        {STAGES.map((st, i) => (
          <li key={st.title} className={s.step}>
            <span className={s.wk}>
              <small>{i === 0 ? "Start" : "Week"}</small>
              {i === 0 ? "0" : st.week}
            </span>
            <div>
              <h3>
                {String(i + 1).padStart(2, "0")} · {st.title}
              </h3>
              <p>{st.what}</p>
            </div>
            <p className={s.you}>
              <b>Your part</b>
              {st.you}
            </p>
          </li>
        ))}
      </ol>

      <section className={t.spec} aria-labelledby="terms">
        <h2 id="terms" className={t.h2}>
          Money and promises
        </h2>
        <dl>
          <div>
            <dt>Quote</dt>
            <dd>Fixed when you sign the drawing. If we got the steel price wrong, that&apos;s on us.</dd>
          </div>
          <div>
            <dt>Deposit</dt>
            <dd>40% on signing the drawing, 40% when the chassis is galvanised, the balance at handover.</dd>
          </div>
          <div>
            <dt>Changes</dt>
            <dd>Free until the chassis is cut. After that, priced on the drawing before we do them.</dd>
          </div>
          <div>
            <dt>Guarantee</dt>
            <dd>5 years on the chassis and welds, 1 year on fittings and electrics.</dd>
          </div>
          <div>
            <dt>Delivery</dt>
            <dd>Collect from the workshop in Cape Town, or we deliver in the Western Cape.</dd>
          </div>
        </dl>
        <p className={t.specNote}>Example terms. Your quote states the real ones.</p>
      </section>

      <section className={t.who} aria-labelledby="handover">
        <h2 id="handover" className={t.h2}>
          What you drive away with
        </h2>
        <ul>
          {HANDOVER.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>

      <FaqList ids={["cost", "time", "roadworthy", "register"]} heading={false} id="faq-process" />

      <section className={t.close}>
        <h2 className={t.closeH}>Week 0 is a WhatsApp.</h2>
        <div className={t.ctas}>
          <Link className={t.primary} href="/contact">
            Start your brief
          </Link>
          <Link className={t.secondary} href="/workshop">
            Inside the workshop →
          </Link>
        </div>
      </section>
    </main>
  );
}
