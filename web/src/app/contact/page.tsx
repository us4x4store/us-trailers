import type { Metadata } from "next";
import Link from "next/link";
import Enquire from "@/components/enquire/Enquire";
import { CONTACT, telLink, waLink } from "@/content/contact";
import t from "@/components/types/type.module.css";
import s from "@/components/pages/pages.module.css";

export const metadata: Metadata = {
  title: "Contact US Trailers: get a price on a custom trailer | Cape Town",
  description: "Send a brief for a custom trailer, WhatsApp us or call. We reply within one working day. Workshop visits in Cape Town by appointment.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  const wa = waLink();
  const tel = telLink();
  return (
    <main id="main" className={t.page}>
      <nav className={t.crumbs} aria-label="Breadcrumb">
        <Link href="/">US Trailers</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Contact</span>
      </nav>
      <header className={`${t.hero} ${s.solo}`}>
        <div className={`${t.copy} ${s.soloCopy}`}>
          <p className={t.eyebrow}>Contact · reply within one working day</p>
          <h1 className={t.h1}>Tell us what you tow.</h1>
          <p className={t.lede}>The quickest start is a WhatsApp with a photo of your bakkie and what you carry. Or fill in the brief below and we&apos;ll come back with questions, then a drawing.</p>
        </div>
      </header>

      {/* PLACEHOLDER contact details until Justin sends his own (content/contact.ts) */}
      <div className={s.channels}>
        {wa && (
          <a className={s.channel} href={wa}>
            <span>WhatsApp</span>
            <b>{CONTACT.phone}</b>
            <small>Photos welcome. Fastest reply.</small>
          </a>
        )}
        {tel && (
          <a className={s.channel} href={tel}>
            <span>Call</span>
            <b>{CONTACT.phone}</b>
            <small>Mon–Fri 07:30–17:00, Sat 08:00–12:00</small>
          </a>
        )}
        <a className={s.channel} href={`mailto:${CONTACT.email}`}>
          <span>Email</span>
          <b>{CONTACT.email}</b>
          <small>For drawings, documents and long briefs.</small>
        </a>
      </div>

      <section className={t.spec} aria-labelledby="visit">
        <h2 id="visit" className={t.h2}>
          Visit the workshop
        </h2>
        <dl>
          <div>
            <dt>Where</dt>
            <dd>Cape Town. We send the address when you book, so someone is there to walk you round.</dd>
          </div>
          <div>
            <dt>Bring</dt>
            <dd>Your tow vehicle and its licence disc. If you can, the thing you want to carry.</dd>
          </div>
          <div>
            <dt>Takes</dt>
            <dd>About an hour: we measure the vehicle, look at builds in progress and sketch the first idea.</dd>
          </div>
        </dl>
      </section>

      <Enquire />
    </main>
  );
}
