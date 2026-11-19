import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Social share card in the Drawing Office style. */
export function ogCard(title: [string, string], kicker = "Custom trailers · Cape Town", sheet = "UST-001") {
  const grid = "linear-gradient(#cdd5d0 1px, transparent 1px), linear-gradient(90deg, #cdd5d0 1px, transparent 1px)";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#E6EAE5", backgroundImage: grid, backgroundSize: "40px 40px", color: "#22262A", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 2 }}>US·TRAILERS</div>
          <div style={{ width: 260, height: 12, borderLeft: "3px solid #1F3B73", borderRight: "3px solid #1F3B73", borderBottom: "3px solid #1F3B73" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 24, color: "#1F3B73", letterSpacing: 4, textTransform: "uppercase" }}>{kicker}</div>
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 0.95, letterSpacing: -2 }}>{title[0]}</div>
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 0.95, letterSpacing: -2, color: "#1F3B73" }}>{title[1]}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#1F3B73", letterSpacing: 2, textTransform: "uppercase", borderTop: "2px solid #22262A", paddingTop: 16 }}>
          <span>Toy haulers · Goosenecks · Off-road · Upgrades</span>
          <span>Dwg {sheet}</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
