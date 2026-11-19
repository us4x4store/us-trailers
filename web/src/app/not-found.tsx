import Link from "next/link";
import TypeDrawing from "@/components/drawings/TypeDrawing";

export default function NotFound() {
  return (
    <main id="main" style={{ minHeight: "100svh", padding: "120px var(--gutter) 80px", display: "grid", gap: 24, alignContent: "center", background: "var(--paper)" }}>
      <p style={{ font: "600 12px/1 var(--mono)", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--red)" }}>Error 404 · Drawing not found</p>
      <h1 style={{ font: "800 clamp(44px, 7vw, 96px)/0.92 var(--display)", fontStretch: "116%", letterSpacing: "-0.02em", maxWidth: "14ch" }}>This sheet isn&apos;t in the drawer.</h1>
      <div style={{ maxWidth: 520, opacity: 0.85 }}>
        <TypeDrawing kind="toyhauler" progress={0.35} label="Unfinished drawing of a trailer" />
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/" style={{ minHeight: 52, display: "inline-grid", placeItems: "center", padding: "0 22px", background: "var(--ink)", color: "var(--paper)", font: "600 12px/1 var(--mono)", letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}>
          Back to the workshop
        </Link>
        <Link href="/#enquire" style={{ minHeight: 52, display: "inline-grid", placeItems: "center", padding: "0 22px", border: "1.5px solid var(--graphite)", color: "var(--graphite)", font: "600 12px/1 var(--mono)", letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}>
          Get a price
        </Link>
      </div>
    </main>
  );
}
