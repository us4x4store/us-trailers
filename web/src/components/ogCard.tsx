import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Social share card in the Drawing Office style. */
export function ogCard(title: [string, string], kicker = "Bespoke Texan-style toy haulers · Cape Town", sheet = "UST-001") {
  const grid = "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#0A0B0D", backgroundImage: grid, backgroundSize: "40px 40px", color: "#F2F1EC", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 2 }}>US·TRAILERS</div>
          <div style={{ width: 260, height: 12, borderLeft: "3px solid #B6A6FF", borderRight: "3px solid #B6A6FF", borderBottom: "3px solid #B6A6FF" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 24, color: "#B6A6FF", letterSpacing: 4, textTransform: "uppercase" }}>{kicker}</div>
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 0.95, letterSpacing: -2 }}>{title[0]}</div>
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 0.95, letterSpacing: -2, color: "#B6A6FF" }}>{title[1]}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#B6A6FF", letterSpacing: 2, textTransform: "uppercase", borderTop: "2px solid #F2F1EC", paddingTop: 16 }}>
          <span>V-nose · Polished aluminium · RGB lighting</span>
          <span>Dwg {sheet}</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
