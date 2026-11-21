import type { Metadata } from "next";
import Link from "next/link";
import t from "@/components/types/type.module.css";
import s from "@/components/pages/pages.module.css";

export const metadata: Metadata = {
  title: "Terms of use | US Trailers",
  description: "Terms for using the US Trailers website: example prices and specifications, towing guidance, the designer and 3D tools, and how quotes work.",
  alternates: { canonical: "/terms" },
};

/* DRAFT for Justin and his attorney to confirm before launch. */
export default function Terms() {
  return (
    <main id="main" className={t.page}>
      <nav className={t.crumbs} aria-label="Breadcrumb">
        <Link href="/">US Trailers</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Terms</span>
      </nav>
      <div className={s.prose}>
        <p className={t.eyebrow}>Terms of use · draft</p>
        <h1 className={t.h1}>Terms of use</h1>
        <p>These terms cover your use of this website. Building a trailer is covered by the written quote and drawing you sign, which take precedence over anything here.</p>
        <h2>Prices and specifications</h2>
        <p>Prices, weights and dimensions on this site are examples to help you plan. They are not an offer. Your fixed price, tare, GVM and dimensions are set on your signed drawing and quote.</p>
        <h2>Towing and licence guidance</h2>
        <p>The tow checker, the test rig and the FAQ summarise the National Road Traffic Regulations as we understand them. They are guidance, not legal advice. The figures on your own vehicle&apos;s licence disc and in its owner&apos;s manual, and the licensing authorities, have the final word.</p>
        <h2>The designer, test rig and 3D models</h2>
        <p>The 3D trailers, physics and weights are simulations drawn from our designs. They show how a build behaves; they are not a measured test of your trailer. Concept renders are marked as such.</p>
        <h2>Your brief</h2>
        <p>When you send us a brief we use it only to reply, draw and quote, as set out in our <Link href="/privacy">privacy notice</Link>.</p>
        <h2>Our designs</h2>
        <p>The drawings, models, text and images on this site belong to US Trailers. You may share links and build codes freely. Please don&apos;t copy the drawings to have a trailer built elsewhere.</p>
        <h2>Liability</h2>
        <p>We take care that this site is accurate, but we can&apos;t promise it is free of errors. To the extent the law allows, we are not liable for loss arising from relying on it instead of your signed quote and drawing. Nothing here limits your rights under the Consumer Protection Act.</p>
        <h2>Contact</h2>
        <p>
          Questions about these terms? <Link href="/contact">Get in touch</Link>.
        </p>
      </div>
    </main>
  );
}
