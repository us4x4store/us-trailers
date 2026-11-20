/**
 * Optional workshop sound, synthesised with Web Audio (no audio files to download).
 * Off by default; the visitor turns it on from the nav, and the choice is remembered.
 */
type Road = { gain: GainNode; filter: BiquadFilterNode; bump: GainNode };

const KEY = "ust-sound";
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let road: Road | null = null;
let enabled = false;
const listeners = new Set<(on: boolean) => void>();

function audio() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
    // 2 s of white noise, reused by every effect
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return ctx;
}

function noiseSource(c: AudioContext, loop = false) {
  const s = c.createBufferSource();
  s.buffer = noise;
  s.loop = loop;
  return s;
}

export const sound = {
  get on() {
    return enabled;
  },
  init() {
    try {
      enabled = localStorage.getItem(KEY) === "1";
    } catch {
      enabled = false;
    }
    // browsers only start audio after a tap or key press, so wake it on the first one
    const wake = () => {
      if (enabled) audio().resume();
    };
    window.addEventListener("pointerdown", wake, { once: true, passive: true });
    window.addEventListener("keydown", wake, { once: true });
    listeners.forEach((f) => f(enabled));
  },
  set(on: boolean) {
    enabled = on;
    try {
      localStorage.setItem(KEY, on ? "1" : "0");
    } catch {
      /* private mode */
    }
    if (on) audio().resume();
    else if (ctx) {
      this.road(0, 0, "tar");
      ctx.suspend();
    }
    listeners.forEach((f) => f(enabled));
  },
  subscribe(f: (on: boolean) => void) {
    listeners.add(f);
    return () => void listeners.delete(f);
  },

  /** MIG weld: crackle of sparks over a short sizzle */
  weld() {
    if (!enabled) return;
    const c = audio();
    const t = c.currentTime;
    const src = noiseSource(c);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 3200;
    bp.Q.value = 0.8;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    // crackle: a burst of random spikes
    for (let i = 0; i < 18; i++) g.gain.setValueAtTime(Math.random() * 0.5 + 0.1, t + i * 0.018 + Math.random() * 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    src.connect(bp).connect(g).connect(master!);
    src.start(t, Math.random());
    src.stop(t + 0.6);
  },

  /** a part set down on the jig: short metallic knock */
  clank() {
    if (!enabled) return;
    const c = audio();
    const t = c.currentTime;
    [180, 431, 913].forEach((f, i) => {
      const o = c.createOscillator();
      o.type = i ? "sine" : "triangle";
      o.frequency.setValueAtTime(f * (0.97 + Math.random() * 0.06), t);
      o.frequency.exponentialRampToValueAtTime(f * 0.82, t + 0.25);
      const g = c.createGain();
      g.gain.setValueAtTime(0.22 / (i + 1), t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35 + i * 0.12);
      o.connect(g).connect(master!);
      o.start(t);
      o.stop(t + 0.7);
    });
  },

  /** gas struts on the ramp: falling hiss */
  hiss() {
    if (!enabled) return;
    const c = audio();
    const t = c.currentTime;
    const src = noiseSource(c);
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.setValueAtTime(5000, t);
    hp.frequency.exponentialRampToValueAtTime(1400, t + 1.4);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    src.connect(hp).connect(g).connect(master!);
    src.start(t);
    src.stop(t + 1.7);
  },

  /** continuous road noise for the test rig: louder and lower on gravel and rock */
  road(kmh: number, roughness: number, surface: "tar" | "gravel" | "rocks") {
    if (!enabled && !road) return;
    const c = audio();
    if (!road) {
      const src = noiseSource(c, true);
      const filter = c.createBiquadFilter();
      filter.type = "lowpass";
      const gain = c.createGain();
      gain.gain.value = 0;
      const bump = c.createGain();
      bump.gain.value = 0;
      src.connect(filter).connect(gain).connect(master!);
      src.connect(bump).connect(master!);
      src.start();
      road = { gain, filter, bump };
    }
    const t = c.currentTime;
    const v = Math.min(1, kmh / 100);
    const base = surface === "tar" ? 0.05 : surface === "gravel" ? 0.14 : 0.18;
    road.filter.frequency.setTargetAtTime(surface === "tar" ? 900 + v * 1400 : 420 + v * 900, t, 0.2);
    road.gain.gain.setTargetAtTime(enabled ? base * v : 0, t, 0.25);
    // stones and corrugations: short bursts that follow how hard the suspension is working
    road.bump.gain.setTargetAtTime(enabled ? Math.min(0.12, roughness * 0.12 * v) : 0, t, 0.05);
  },
};
