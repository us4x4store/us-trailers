"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Lenis smooth scroll driven by GSAP's ticker so ScrollTrigger and the 3D film stay in lockstep. */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.2 });
    lenis.on("scroll", ScrollTrigger.update);
    if (process.env.NODE_ENV !== "production") (window as unknown as { __lenis: Lenis }).__lenis = lenis;
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const onAnchor = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const el = document.querySelector(a.getAttribute("href")!);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { duration: 1.6 });
    };
    document.addEventListener("click", onAnchor);
    return () => {
      document.removeEventListener("click", onAnchor);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  return null;
}
