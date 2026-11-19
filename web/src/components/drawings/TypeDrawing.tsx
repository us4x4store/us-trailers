import type { CSSProperties } from "react";

/**
 * Side-elevation line drawings in the house drafting style. 1 unit ≈ 1 cm, ground at y = 300.
 * Phantom (dashed) lines show things that aren't ours, like the tow vehicle, as drawing convention does.
 * `progress` (0..1) draws the lines in order, for the build timeline.
 */
type Kind = "toyhauler" | "gooseneck" | "offroad" | "modify";

const WHEEL = (x: number, r = 37) => [
  `M${x - r},263 a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0`,
  `M${x - 22},263 a22,22 0 1,0 44,0 a22,22 0 1,0 -44,0`,
];

const PATHS: Record<
  Kind,
  {
    solid: string[];
    phantom?: string[];
    dims: {
      d: string;
      label: string;
      x: number;
      y: number;
      rotate?: boolean;
    }[];
    revs?: { cx: number; cy: number; r: number; tag: string }[];
  }
> = {
  toyhauler: {
    solid: [
      "M196,8 H584 V15 H196 Z",
      "M150,62 Q150,20 192,20 L620,20 Q630,20 630,30 L630,220 L150,220 Z",
      "M150,74 L112,132 L112,218 L150,218 Z",
      "M200,62 H270 V210 H200 Z",
      "M482,56 H580 V100 H482 Z",
      "M612,26 V214",
      "M138,220 H640 V232 H138 Z",
      "M150,222 L36,242 L36,252 L150,234 Z",
      "M8,238 H38 V254 H8 Z",
      "M72,238 V278",
      "M312,236 C312,214 330,208 360,208 L446,208 C476,208 494,214 494,236",
      ...WHEEL(360),
      ...WHEEL(446),
    ],
    dims: [
      {
        d: "M8,325 H640 M8,318 V332 M640,318 V332",
        label: "6 330 overall",
        x: 324,
        y: 345,
      },
      {
        d: "M670,8 V300 M663,8 H677 M663,300 H677",
        label: "2 900",
        x: 690,
        y: 154,
        rotate: true,
      },
    ],
  },
  gooseneck: {
    solid: [
      "M210,222 H690 V40 H50 V140 H210 Z",
      "M50,140 H210",
      "M80,140 V196 M66,196 H94",
      "M90,64 H190 V112 H90 Z",
      "M560,70 H660 V114 H560 Z",
      "M300,92 H360 V212 H300 Z",
      "M672,46 V214",
      "M200,222 H700 V234 H200 Z",
      "M470,236 C470,214 488,208 518,208 L604,208 C634,208 652,214 652,236",
      ...WHEEL(518),
      ...WHEEL(604),
    ],
    phantom: [
      "M-50,196 H150 M150,196 V150 H300",
      "M-50,196 V226",
      ...WHEEL(40, 38),
    ],
    dims: [
      {
        d: "M50,325 H700 M50,318 V332 M700,318 V332",
        label: "6 500 body",
        x: 375,
        y: 345,
      },
      {
        d: "M730,40 V300 M723,40 H737 M723,300 H737",
        label: "2 600",
        x: 750,
        y: 170,
        rotate: true,
      },
    ],
  },
  offroad: {
    solid: [
      "M170,96 H470 V122 H170 Z",
      "M170,150 Q170,122 200,122 L470,122 L520,150 L520,222 L170,222 Z",
      "M120,150 H170 V222 H120 Z",
      "M126,160 H164 V214 H126 Z",
      "M260,140 H420 V200 H260 Z",
      "M160,226 H530 V238 H160 Z",
      "M160,228 L30,246 L30,254 L160,240 Z",
      "M4,242 H34 V258 H4 Z",
      "M300,238 C300,212 318,202 352,202 C386,202 404,212 404,238",
      "M352,263 m-41,0 a41,41 0 1,0 82,0 a41,41 0 1,0 -82,0",
      "M352,263 m-24,0 a24,24 0 1,0 48,0 a24,24 0 1,0 -48,0",
      "M300,226 L352,263 L380,226",
    ],
    phantom: ["M520,160 H600 V200 H520"],
    dims: [
      {
        d: "M4,325 H530 M4,318 V332 M530,318 V332",
        label: "5 300 overall",
        x: 267,
        y: 345,
      },
      {
        d: "M560,96 V300 M553,96 H567 M553,300 H567",
        label: "2 040",
        x: 580,
        y: 198,
        rotate: true,
      },
    ],
  },
  modify: {
    solid: [
      "M170,200 H580 V214 H170 Z",
      "M170,170 H580 M170,170 V200 M580,170 V200 M250,170 V200 M330,170 V200 M410,170 V200 M490,170 V200",
      "M160,214 H590 V224 H160 Z",
      "M170,216 L40,240 L40,248 L170,228 Z",
      "M14,236 H44 V252 H14 Z",
      "M320,226 C320,206 336,198 365,198 C394,198 410,206 410,226",
      ...WHEEL(365),
      "M574,188 H584 V200 H574 Z",
    ],
    dims: [
      {
        d: "M14,325 H590 M14,318 V332 M590,318 V332",
        label: "5 760 overall",
        x: 302,
        y: 345,
      },
    ],
    revs: [
      { cx: 365, cy: 250, r: 62, tag: "A  Independent suspension" },
      { cx: 579, cy: 194, r: 26, tag: "B  LED lights + contour tape" },
      { cx: 105, cy: 236, r: 34, tag: "C  Override brakes" },
    ],
  },
};

export default function TypeDrawing({
  kind,
  progress,
  label,
}: {
  kind: Kind;
  progress?: number;
  label: string;
}) {
  const d = PATHS[kind];
  const animated = typeof progress === "number";
  const total = d.solid.length;
  return (
    <>
      <svg
        viewBox="-60 -20 840 380"
        role="img"
        aria-label={label}
        className="drw"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          overflow: "visible",
        }}
      >
        <path
          d="M-60,300 H780"
          stroke="#1F3B73"
          strokeWidth="1"
          strokeDasharray="6 4 1 4"
          fill="none"
        />
        {d.phantom && (
          <g
            fill="none"
            stroke="#5E6461"
            strokeWidth="1"
            strokeDasharray="7 5"
            vectorEffect="non-scaling-stroke"
          >
            {d.phantom.map((p, i) => (
              <path key={i} d={p} />
            ))}
          </g>
        )}
        <g
          fill="none"
          stroke="#22262A"
          strokeWidth="1.4"
          strokeLinejoin="round"
        >
          {d.solid.map((p, i) => {
            const k = animated
              ? Math.min(1, Math.max(0, progress! * total * 1.05 - i))
              : 1;
            const style: CSSProperties | undefined = animated
              ? {
                  strokeDasharray: 1,
                  strokeDashoffset: 1 - k,
                  transition: "stroke-dashoffset .35s ease",
                }
              : undefined;
            return <path key={i} d={p} pathLength={1} style={style} />;
          })}
        </g>
        <g
          stroke="#1F3B73"
          strokeWidth="1"
          fill="none"
          opacity={animated ? Math.min(1, (progress ?? 0) * 3) : 1}
        >
          {d.dims.map((m) => (
            <path key={m.d} d={m.d} />
          ))}
        </g>
        <g
          fill="#1F3B73"
          fontFamily="var(--mono), ui-monospace, monospace"
          fontSize="12"
          letterSpacing="1.2"
          opacity={animated ? Math.min(1, (progress ?? 0) * 3) : 1}
        >
          {d.dims.map((m) => (
            <text
              key={m.label}
              x={m.x}
              y={m.y}
              textAnchor="middle"
              transform={m.rotate ? `rotate(90 ${m.x} ${m.y})` : undefined}
            >
              {m.label.toUpperCase()}
            </text>
          ))}
        </g>
        {d.revs && (
          <g fill="none" stroke="#B8352A" strokeWidth="1.3">
            {d.revs.map((r) => (
              <g key={r.tag}>
                <circle cx={r.cx} cy={r.cy} r={r.r} strokeDasharray="3 3" />
                <circle
                  cx={r.cx + r.r * 0.72}
                  cy={r.cy - r.r * 0.72}
                  r={20}
                  fill="#E6EAE5"
                />
                <text
                  x={r.cx + r.r * 0.72}
                  y={r.cy - r.r * 0.72 + 8}
                  textAnchor="middle"
                  fill="#B8352A"
                  stroke="none"
                  fontFamily="var(--mono), ui-monospace, monospace"
                  fontSize="22"
                  fontWeight="600"
                  className="drw-keep"
                >
                  {r.tag[0]}
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>
      {d.revs && (
        <ol className="drw-legend">
          {d.revs.map((r) => (
            <li key={r.tag}>
              <b>{r.tag[0]}</b>
              {r.tag.slice(1).trim()}
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
