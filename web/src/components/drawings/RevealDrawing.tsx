"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import TypeDrawing from "./TypeDrawing";

/** Draws the sheet line by line when it scrolls into view (instantly with reduced motion). */
export default function RevealDrawing(props: Omit<ComponentProps<typeof TypeDrawing>, "progress">) {
  const box = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(1); // server render and no-JS: complete drawing
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = box.current!;
    // only animate drawings that start below the fold, so nothing visible blinks on load
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setP(0.001);
    let raf = 0;
    const io = new IntersectionObserver(
      (es) => {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / 1700);
          setP(1 - Math.pow(1 - k, 3));
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={box}>
      <TypeDrawing {...props} progress={p} />
    </div>
  );
}
