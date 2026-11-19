import type { Metadata } from "next";
import Link from "next/link";
import FaqList, { faqJsonLd } from "@/components/faq/FaqList";

export const metadata: Metadata = {
  title: "Towing laws South Africa: licence codes, brakes, roadworthy | US Trailers",
  description:
    "Can you tow on a code B licence? When does a trailer need brakes or a roadworthy? Licence fees, size limits and the 100 km/h bakkie rule, explained from the National Road Traffic Regulations.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <main id="main" style={{ paddingTop: 84, background: "var(--paper)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }} />
      <FaqList />
      <p style={{ padding: "0 var(--gutter) 96px", font: "500 13px/1.6 var(--mono)" }}>
        Still not sure? <Link href="/#enquire" style={{ color: "var(--ink)" }}>Ask us about your vehicle and licence</Link> and we&apos;ll work it out with you.
      </p>
    </main>
  );
}
