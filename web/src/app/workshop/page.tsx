import type { Metadata } from "next";
import Link from "next/link";
import Photo from "@/components/Photo";
import { IMAGES } from "@/content/images";
import { buildTrailer, CHAPTERS, DEFAULT_CONFIG, tareKg } from "@/trailer/model";
import { partMassKg } from "@/trailer/mass";
import t from "@/components/types/type.module.css";
import s from "@/components/pages/pages.module.css";

export const metadata: Metadata = {
  title: "The workshop: materials, welding and quality checks | US Trailers",
  description: "What a US Trailers trailer is made of, part by part: galvanised chassis, running gear, body, wiring and finishes. Plus the checks every trailer passes before handover.",
  alternates: { canonical: "/workshop" },
};

/* EXAMPLE checklist until Justin confirms his workshop's own QA sheet (questions batch 1, Q9) */
const CHECKS: [string, string][] = [
  ["Square", "Chassis diagonals within 3 mm before the first weld is finished."],
  ["Welds", "Every structural weld inspected by eye and by hand, ground only where a part sits on it."],
  ["Galvanising", "Hot-dip, inside and out, with drain holes drawn in so nothing rusts from the inside."],
  ["Torque", "Wheel nuts, U-bolts and coupling bolts torqued to spec and marked with paint."],
  ["Bearings", "Packed, adjusted and spun by hand, then checked again after the road test."],
  ["Brakes", "Balanced side to side, tested on the road; the breakaway cable is tested too."],
  ["Lights", "Every light tested against the harness diagram; harness labelled at both ends."],
  ["Water", "Tanks and lines pressure-tested overnight."],
  ["Weight", "Weighed at a weighbridge, empty, and the tare stamped on the information plate."],
  ["Hitch load", "Measured with the client's load, and set between 7% and 10%."],
  ["Road test", "Tar and gravel, loaded, at the speeds the client will drive."],
  ["Paperwork", "Registration, roadworthy, licence disc, and a copy of the drawing in the trailer."],
];

const fmt = (n: number) => n.toLocaleString("en-ZA").replace(/,/g, " ");

export default function Workshop() {
  const parts = buildTrailer(DEFAULT_CONFIG);
  return (
    <main id="main" className={t.page}>
      <nav className={t.crumbs} aria-label="Breadcrumb">
        <Link href="/">US Trailers</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">The workshop</span>
      </nav>
      <header className={t.hero}>
        <div className={t.copy}>
          <p className={t.eyebrow}>The workshop · Cape Town</p>
          <h1 className={t.h1}>Steel, measured twice.</h1>
          <p className={t.lede}>Trailers fail at the joints: a weld that cracks, a bearing that runs dry, a wire that chafes. So that is where we spend our time. Here is what goes into one of our trailers, and what we check before it leaves.</p>
          <div className={t.ctas}>
            <Link className={t.primary} href="/contact">
              Book a workshop visit
            </Link>
            <Link className={t.secondary} href="/#film">
              Watch one go together
            </Link>
          </div>
        </div>
        <div className={s.facts} role="group" aria-label="One build in numbers">
          <div className={s.fact}>
            <b>{parts.length}</b>
            <span>Parts in a toy hauler</span>
          </div>
          <div className={s.fact}>
            <b>{fmt(tareKg(DEFAULT_CONFIG))}</b>
            <span>kg, weighed not guessed</span>
          </div>
          <div className={s.fact}>
            <b>{CHECKS.length}</b>
            <span>Checks before handover</span>
          </div>
          <div className={s.fact}>
            <b>3</b>
            <span>mm, chassis square</span>
          </div>
        </div>
      </header>

      <Photo img={IMAGES.workshop} sizes="100vw" eager className={t.photo} />

      <section className={t.spec} aria-labelledby="bom">
        <h2 id="bom" className={t.h2}>
          Every part, and what it&apos;s made of
        </h2>
        <div className={s.bomWrap}>
          <table className={s.bom}>
            <caption className="sr-only">Bill of materials for a 4.8 m tandem toy hauler</caption>
            <thead>
              <tr>
                <th scope="col">Part</th>
                <th scope="col">Stage</th>
                <th scope="col">Material</th>
                <th scope="col">Spec</th>
                <th scope="col">kg</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{CHAPTERS.find((c) => c.id === p.chapter)?.title}</td>
                  <td>{p.material}</td>
                  <td>{p.spec}</td>
                  <td>{Math.round(partMassKg(p))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={t.specNote}>
          The 4.8 m tandem toy hauler from the film. Parts total, with welds, paint and fasteners: {fmt(tareKg(DEFAULT_CONFIG))} kg tare.
        </p>
      </section>

      <section className={t.points} aria-labelledby="checks">
        <h2 id="checks" className={t.h2}>
          Twelve checks before handover
        </h2>
        <ul className={s.checks}>
          {CHECKS.map(([k, v]) => (
            <li key={k}>
              <span>
                <b>{k}.</b> {v}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Photo img={IMAGES.weld} sizes="100vw" className={t.photo} />

      <section className={t.close}>
        <h2 className={t.closeH}>Come and see the jig. Bring your bakkie.</h2>
        <div className={t.ctas}>
          <Link className={t.primary} href="/contact">
            Book a visit
          </Link>
          <Link className={t.secondary} href="/how-it-works">
            How a build works →
          </Link>
        </div>
      </section>
    </main>
  );
}
