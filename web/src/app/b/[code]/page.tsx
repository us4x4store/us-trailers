import type { Metadata } from "next";
import { KINDS, type Kind, type TrailerConfig } from "@/trailer/model";
import { KIND_LENGTHS } from "@/trailer/catalogue";
import { COLOURS, decodeBuild, encodeBuild, priceRange, rand, specs } from "@/trailer/pricing";
import OpenBuild from "./OpenBuild";

type Props = { params: Promise<{ code: string }> };

/** every buildable code, so each share card is prerendered */
export function generateStaticParams() {
  const codes = new Set<string>();
  for (const kind of Object.keys(KIND_LENGTHS) as Kind[])
    for (const length of KIND_LENGTHS[kind])
      for (const axles of [1, 2] as const)
        for (const c of COLOURS)
          for (const rack of [false, true])
            for (const solar of [false, true]) {
              const cfg: TrailerConfig = { kind, length, axles, colour: c.hex, rack, solar };
              const code = encodeBuild(cfg);
              const back = decodeBuild(code);
              if (back && encodeBuild(back) === code) codes.add(code);
            }
  return [...codes].map((code) => ({ code }));
}

/** Share link for one build. Crawlers read its own card; people are sent straight to the designer with it loaded. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const cfg = decodeBuild(code);
  if (!cfg) return { title: "Build not found | US Trailers", robots: { index: false } };
  const s = specs(cfg);
  const [lo, hi] = priceRange(cfg);
  const name = KINDS.find((k) => k.id === (cfg.kind ?? "toyhauler"))?.name ?? "trailer";
  const title = `${s.bodyMm.toLocaleString("en-ZA").replace(/,/g, " ")} mm ${name.toLowerCase()}, build ${code} | US Trailers`;
  const description = `${cfg.axles === 2 ? "Tandem" : "Single"} axle, tare ${s.tare} kg, GVM ${s.gvm} kg, code ${s.licence}. Example price ${rand(lo)} – ${rand(hi)}. Open it, change it, get a price.`;
  const image = { url: `/api/og/${code}`, width: 1200, height: 630, alt: title };
  return { title, description, robots: { index: false }, openGraph: { title, description, images: [image] }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

export default async function SharedBuild({ params }: Props) {
  const { code } = await params;
  const ok = !!decodeBuild(code);
  const href = ok ? `/?build=${code}#design` : "/#design";
  return (
    <main id="main" style={{ minHeight: "70svh", display: "grid", placeContent: "center", gap: 16, padding: "96px var(--gutter)", fontFamily: "var(--mono)" }}>
      <p>{ok ? `Opening build ${code} in the designer…` : "That build code doesn't look right. Start a fresh one in the designer."}</p>
      <a href={href} style={{ color: "var(--ink)", minHeight: 44, display: "inline-flex", alignItems: "center" }}>
        {ok ? "Open the build" : "Open the designer"}
      </a>
      {ok && <OpenBuild href={href} />}
    </main>
  );
}
