import { ImageResponse } from "next/og";
import { axlePositions, DIM, GN, KINDS, OFF, overallLength } from "@/trailer/model";
import { COLOURS, decodeBuild, priceRange, rand, specs } from "@/trailer/pricing";
import { ogCard, OG_SIZE } from "@/components/ogCard";
import { SITE_URL } from "@/content/site";

const fmt = (n: number) => n.toLocaleString("en-ZA").replace(/,/g, " ");

/** Share card for one build: its own side elevation, title block and price. WhatsApp and socials unfurl this. */
export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const cfg = decodeBuild(code);
  if (!cfg) return ogCard(["Drawn for you.", "Built once."]);
  const kind = cfg.kind ?? "toyhauler";
  const d = kind === "offroad" ? OFF : kind === "gooseneck" ? GN : DIM;
  const L = cfg.length;
  const total = overallLength(cfg);
  const s = specs(cfg);
  const [lo, hi] = priceRange(cfg);
  // drawing space: metres to px, trailer centred, hitch to the right
  const W = 1072, H = 300, sc = Math.min(W / (total + 0.6), H / (d.roofY + 0.4));
  const x0 = (W - total * sc) / 2 + (L / 2) * sc; // where x = 0 lands
  const X = (m: number) => x0 + m * sc;
  const Y = (m: number) => H - 20 - m * sc;
  const body = cfg.colour;
  const front = kind === "gooseneck" ? `M${X(L / 2)},${Y(GN.neckFloor)} H${X(L / 2 + GN.neck)} V${Y(d.roofY - 0.25)} Q${X(L / 2 + GN.neck)},${Y(d.roofY)} ${X(L / 2 + GN.neck - 0.3)},${Y(d.roofY)} H${X(L / 2)} Z` : "";
  const bar = kind !== "gooseneck" ? `M${X(L / 2)},${Y(d.railY)} L${X(total - L / 2)},${Y((d as typeof DIM).coupleH ?? d.railY)}` : "";
  const colour = COLOURS.find((c) => c.hex === cfg.colour)?.name ?? "";
  const name = KINDS.find((k) => k.id === kind)?.name ?? "Trailer";
  const grid = "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "44px 64px", background: "#0A0B0D", backgroundImage: grid, backgroundSize: "40px 40px", color: "#F2F1EC", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 24, color: "#B6A6FF", letterSpacing: 4, textTransform: "uppercase" }}>Drawn for one client</div>
            <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1, letterSpacing: -1 }}>{`${fmt(s.bodyMm)} mm ${name.toLowerCase()}`}</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 2 }}>US·TRAILERS</div>
        </div>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ marginTop: 12 }}>
          <path d={`M0,${Y(0)} H${W}`} stroke="#B6A6FF" strokeWidth="1.5" strokeDasharray="10 6 2 6" />
          {bar && <path d={bar} stroke="#F2F1EC" strokeWidth="7" />}
          <rect x={X(-L / 2)} y={Y(d.roofY)} width={L * sc} height={(d.roofY - d.floorY) * sc} fill={body} stroke="#F2F1EC" strokeWidth="3" />
          {front && <path d={front} fill={body} stroke="#F2F1EC" strokeWidth="3" />}
          <path d={`M${X(-L / 2)},${Y(d.railY)} H${X(L / 2)}`} stroke="#F2F1EC" strokeWidth="6" />
          {axlePositions(cfg).map((ax) => (
            <circle key={ax} cx={X(ax)} cy={Y(d.wheelR)} r={d.wheelR * sc} fill="#F2F1EC" stroke="#0A0B0D" strokeWidth="3" />
          ))}
          {axlePositions(cfg).map((ax) => (
            <circle key={"h" + ax} cx={X(ax)} cy={Y(d.wheelR)} r={d.wheelR * sc * 0.45} fill="#C9CCD0" />
          ))}
          <path d={`M${X(-L / 2)},${Y(0) + 14} H${X(-L / 2 + total)}`} stroke="#B6A6FF" strokeWidth="1.5" />
        </svg>
        <div style={{ display: "flex", marginTop: "auto", border: "2px solid rgba(242,241,236,0.4)", background: "#0A0B0D", fontSize: 22, textTransform: "uppercase", letterSpacing: 1 }}>
          {[
            ["Build", code],
            ["Overall", `${fmt(Math.round(total * 1000))} mm`],
            ["Axles", cfg.axles === 2 ? "Tandem" : "Single"],
            ["Tare / GVM", `${fmt(s.tare)} / ${fmt(s.gvm)} kg`],
            ["Licence", `Code ${s.licence}`],
            ["Example price", `${rand(lo)}–${rand(hi).replace("R", "")}`],
          ].map(([k, v], i) => (
            <div key={k} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "12px 14px", borderLeft: i ? "1.5px solid #F2F1EC" : "none", flexGrow: 1 }}>
              <span style={{ fontSize: 15, color: "#B6A6FF", letterSpacing: 2 }}>{k}</span>
              <span style={{ fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 10, fontSize: 17, color: "#9A9CA3", letterSpacing: 1 }}>{`${colour ? colour + " · " : ""}Built in Cape Town · ${new URL(SITE_URL).host}`}</div>
      </div>
    ),
    { ...OG_SIZE, headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  );
}
