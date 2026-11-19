import { ImageResponse } from "next/og";

export const alt = "US Trailers: custom trailers drawn for you and built once, in Cape Town";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social share card in the Drawing Office style: drafting paper, ink, a side elevation. */
export default function OgImage() {
  const grid = "linear-gradient(#cdd5d0 1px, transparent 1px), linear-gradient(90deg, #cdd5d0 1px, transparent 1px)";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#E6EAE5", backgroundImage: grid, backgroundSize: "40px 40px", color: "#22262A", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 2 }}>US·TRAILERS</div>
          <div style={{ width: 260, height: 12, borderLeft: "3px solid #1F3B73", borderRight: "3px solid #1F3B73", borderBottom: "3px solid #1F3B73" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 24, color: "#1F3B73", letterSpacing: 4, textTransform: "uppercase" }}>Custom trailers · Cape Town</div>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 0.95, letterSpacing: -2 }}>Drawn for you.</div>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 0.95, letterSpacing: -2, color: "#1F3B73" }}>Built once.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#1F3B73", letterSpacing: 2, textTransform: "uppercase", borderTop: "2px solid #22262A", paddingTop: 16 }}>
          <span>Toy haulers · Goosenecks · Off-road · Upgrades</span>
          <span>Dwg UST-001</span>
        </div>
      </div>
    ),
    size,
  );
}
