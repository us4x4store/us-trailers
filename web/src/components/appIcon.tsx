import { ImageResponse } from "next/og";

/** App icon: the wordmark's "US" over the drawing-office dimension bracket. */
export function appIcon(px: number) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#22262A", color: "#E6EAE5" }}>
        <div style={{ fontSize: px * 0.42, fontWeight: 800, letterSpacing: -px * 0.01, lineHeight: 1 }}>US</div>
        <div style={{ width: px * 0.5, height: px * 0.07, marginTop: px * 0.04, borderLeft: `${px * 0.025}px solid #A9C0EE`, borderRight: `${px * 0.025}px solid #A9C0EE`, borderBottom: `${px * 0.025}px solid #A9C0EE` }} />
      </div>
    ),
    { width: px, height: px },
  );
}
