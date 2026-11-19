/**
 * Test-road surfaces. Every function is periodic over TILE metres along X so the rig can
 * teleport the whole convoy back by one tile and keep driving forever without a seam.
 */
export type Surface = "tar" | "gravel" | "rocks";

export const TILE = 60;
export const ROAD = { x0: -40, len: 180, halfW: 4.5 };

const TAU = Math.PI * 2;
const per = (x: number, wl: number) => TAU * (x / (TILE / Math.round(TILE / wl)));

/** deterministic rock field for one tile */
const ROCKS = (() => {
  let s = 1234567;
  const rnd = () => ((s = (s * 48271) % 2147483647) / 2147483647);
  return Array.from({ length: 46 }, () => ({
    x: rnd() * TILE,
    z: (rnd() * 2 - 1) * 2.4,
    h: 0.05 + rnd() * 0.11,
    r: 0.22 + rnd() * 0.32,
  }));
})();

export function heightAt(x: number, z: number, surface: Surface): number {
  // a slight crown so water runs off, as on real roads
  const crown = -0.012 * (z / ROAD.halfW) ** 2;
  if (surface === "tar") return crown + 0.003 * Math.sin(per(x, 6)) * Math.cos(per(z + 3, 4));
  // Corrugations ("sinkplaat"): ~0.75 m spacing, ~20 mm deep, strongest in the wheel tracks.
  const track = Math.exp(-(((Math.abs(z) - 1.05) / 0.7) ** 2));
  const corr = 0.02 * Math.sin(per(x, 0.75)) * (0.45 + 0.55 * track);
  const swell = 0.05 * Math.sin(per(x, 15)) + 0.02 * Math.sin(per(x, 6.67) + z * 0.4);
  if (surface === "gravel") return crown + corr + swell;
  // Rocks: axle-twisters (alternating left/right dips) + scattered boulders.
  const twist = 0.11 * Math.sin(per(x, 7.5)) * Math.tanh(z * 1.4);
  let rock = 0;
  const xm = ((x % TILE) + TILE) % TILE;
  for (const r of ROCKS) {
    let dx = xm - r.x;
    if (dx > TILE / 2) dx -= TILE;
    if (dx < -TILE / 2) dx += TILE;
    const d2 = (dx * dx + (z - r.z) * (z - r.z)) / (r.r * r.r);
    if (d2 < 9) rock += r.h * Math.exp(-d2);
  }
  return crown + corr * 0.5 + swell * 0.6 + twist + rock;
}

/**
 * Heights laid out for Rapier's heightfield: (nrows + 1) × (ncols + 1) samples,
 * column-major, rows along Z, columns along X, centred on the collider.
 */
export function heightfield(surface: Surface, dx: number, dz: number) {
  const ncols = Math.round(ROAD.len / dx);
  const nrows = Math.round((ROAD.halfW * 2) / dz);
  const heights = new Float32Array((nrows + 1) * (ncols + 1));
  for (let j = 0; j <= ncols; j++) {
    const x = ROAD.x0 + (j / ncols) * ROAD.len;
    for (let i = 0; i <= nrows; i++) {
      const z = -ROAD.halfW + (i / nrows) * ROAD.halfW * 2;
      heights[i + j * (nrows + 1)] = heightAt(x, z, surface);
    }
  }
  return { nrows, ncols, heights, scale: { x: ROAD.len, y: 1, z: ROAD.halfW * 2 }, centre: [ROAD.x0 + ROAD.len / 2, 0, 0] as [number, number, number] };
}
