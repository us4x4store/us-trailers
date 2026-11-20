import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy notice (POPIA) | US Trailers",
  description: "How US Trailers collects, uses and protects the personal information you send us, under the Protection of Personal Information Act (POPIA).",
  alternates: { canonical: "/privacy" },
};

const S = { h2: { font: "800 26px/1.1 var(--display)", fontStretch: "110%", marginTop: 28 } as const, p: { font: "400 17px/1.6 var(--display)", maxWidth: "68ch" } as const };

/* Draft for Justin to confirm: responsible party details and information officer still to be added. */
export default function Privacy() {
  return (
    <main id="main" style={{ padding: "120px var(--gutter) 96px", display: "grid", gap: 14, background: "var(--paper)" }}>
      <p style={{ font: "600 12px/1 var(--mono)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink)" }}>POPIA</p>
      <h1 style={{ font: "800 clamp(40px, 6vw, 80px)/0.95 var(--display)", fontStretch: "116%", letterSpacing: "-0.02em" }}>Privacy notice</h1>
      <h2 style={S.h2}>Who is responsible</h2>
      <p style={S.p}>US Trailers, Cape Town, South Africa. Information officer: Justin, owner. Email: hello@ustrailers.co.za. (Placeholder details, to be confirmed before launch.)</p>
      <h2 style={S.h2}>What we collect</h2>
      <p style={S.p}>When you send us a brief we collect what you type into the form: your name, phone or WhatsApp number, email address, town, tow vehicle, licence code and your trailer design. We don&apos;t collect anything else about you, and the site doesn&apos;t use advertising cookies.</p>
      <h2 style={S.h2}>Why we collect it</h2>
      <p style={S.p}>Only to answer your enquiry, draw and quote your trailer, and, if you go ahead, build, register and service it. We don&apos;t sell or share your details for marketing.</p>
      <h2 style={S.h2}>Who sees it</h2>
      <p style={S.p}>The US Trailers team, and the service providers that host this website and deliver its email, only so far as they need to. If your build goes ahead, we share what is legally required with the licensing authorities to register your trailer.</p>
      <h2 style={S.h2}>How long we keep it</h2>
      <p style={S.p}>For as long as we&apos;re talking about or building your trailer, and afterwards for as long as the law requires us to keep business records. Enquiries that go nowhere are deleted after 12 months.</p>
      <h2 style={S.h2}>Your rights</h2>
      <p style={S.p}>You may ask what we hold about you, ask us to correct or delete it, or object to how we use it. You may also complain to the Information Regulator (inforegulator.org.za).</p>
      <p style={{ ...S.p, marginTop: 28 }}>
        To ask about your information, <Link href="/#enquire">send us a message</Link>.
      </p>
    </main>
  );
}
