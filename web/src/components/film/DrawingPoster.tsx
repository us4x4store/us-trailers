/**
 * Server-rendered side-elevation drawing shown before WebGL loads.
 * It is the first frame of the film, so the page is never blank and LCP is a cheap SVG.
 */
export function DrawingPoster({ faded }: { faded: boolean }) {
  return (
    <svg
      viewBox="-60 -80 840 460"
      preserveAspectRatio="xMidYMid meet"
      style={{
        position: "absolute",
        inset: "18% 6% 14% 6%",
        width: "88%",
        height: "68%",
        opacity: faded ? 0 : 1,
        transition: "opacity 0.6s ease",
        pointerEvents: "none",
      }}
      role="img"
      className="drw"
      aria-label="Side elevation drawing of a tandem-axle toy hauler"
    >
      <g fill="none" stroke="#1F3B73" strokeWidth="1.3" strokeLinejoin="round">
        <path d="M196,8 H584 V15 H196 Z" />
        <path d="M150,62 Q150,20 192,20 L620,20 Q630,20 630,30 L630,220 L150,220 Z" />
        <path d="M150,74 L112,132 L112,218 L150,218 Z" />
        <path d="M200,62 H270 V210 H200 Z" />
        <path d="M482,56 H580 V100 H482 Z" />
        <path d="M612,26 V214" />
        <path d="M138,220 H640 V232 H138 Z" />
        <path d="M150,222 L36,242 L36,252 L150,234 Z" />
        <path d="M8,238 H38 V254 H8 Z" />
        <path d="M72,238 V278" />
        <circle cx="72" cy="286" r="9" />
        <path d="M312,236 C312,214 330,208 360,208 L446,208 C476,208 494,214 494,236" />
        {[360, 446].map((x) => (
          <g key={x}>
            <circle cx={x} cy={263} r={37} />
            <circle cx={x} cy={263} r={22} />
            <circle cx={x} cy={263} r={6} />
          </g>
        ))}
      </g>
      <g stroke="#1F3B73" strokeWidth="1" fill="none">
        <path d="M-40,300 H760" strokeDasharray="6 4 1 4" />
        <path d="M8,325 H630 M8,318 V332 M630,318 V332" />
        <path d="M670,20 V300 M663,20 H677 M663,300 H677" />
      </g>
      <g fill="#1F3B73" fontFamily="ui-monospace, monospace" fontSize="11" letterSpacing="1">
        <text x="319" y="345" textAnchor="middle">
          6 330 OVERALL
        </text>
        <text x="690" y="164" transform="rotate(90 690 164)" textAnchor="middle">
          2 800
        </text>
      </g>
    </svg>
  );
}
