import { CHAPTERS, type ChapterId, type Part } from "@/trailer/model";

/** Scroll progress range for each chapter (0..1 across the whole film). */
export const RANGES: Record<ChapterId, [number, number]> = {
  drawing: [0, 0.1],
  chassis: [0.1, 0.24],
  running: [0.24, 0.34],
  wheels: [0.34, 0.44],
  frame: [0.44, 0.56],
  skin: [0.56, 0.68],
  doors: [0.68, 0.78],
  systems: [0.78, 0.88],
  finish: [0.88, 1],
};

export type Window = { start: number; end: number };

/** Each part flies in during its own slice of its chapter, overlapping its neighbour slightly. */
export function partWindows(parts: Part[]): Window[] {
  const byChapter = new Map<ChapterId, number[]>();
  parts.forEach((p, i) => {
    if (!byChapter.has(p.chapter)) byChapter.set(p.chapter, []);
    byChapter.get(p.chapter)!.push(i);
  });
  const out: Window[] = new Array(parts.length);
  for (const [ch, idx] of byChapter) {
    const [a, b] = RANGES[ch];
    const span = (b - a) * 0.86; // leave a beat at the end of each chapter to read
    const slot = span / idx.length;
    idx.forEach((pi, k) => {
      const start = a + k * slot;
      out[pi] = { start, end: Math.min(b, start + slot * 1.6) };
    });
  }
  return out;
}

export function chapterAt(p: number) {
  let i = 0;
  CHAPTERS.forEach((c, k) => {
    if (p >= RANGES[c.id][0]) i = k;
  });
  return i;
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** gentle settle with a 4% overshoot, like a part dropped into a jig */
export const easeSettle = (x: number) => {
  const c1 = 0.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/** Mutable state shared between the scroll driver, the canvas and the DOM overlay (no React re-renders per frame). */
export const film = {
  p: 0, // scroll target
  ps: 0, // smoothed progress used by the scene
  explode: 0, // 0..1 target
  pinned: -1 as number, // part index pinned by click
  active: -1 as number,
  lights: false,
  ramp: false,
  listeners: new Set<() => void>(),
  label: null as HTMLDivElement | null,
  avoid: [] as (HTMLElement | null)[],
  emit() {
    this.listeners.forEach((f) => f());
  },
};
