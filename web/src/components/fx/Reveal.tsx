"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Section headings rise into view line by line as they scroll in. Works on every h2 inside main
 * (and anything marked data-reveal), without touching each component. Reduced motion: no effect.
 */
export default function Reveal() {
  const path = usePathname();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = [...document.querySelectorAll<HTMLElement>("main h2, [data-reveal]")].filter((el) => !el.closest("#film"));
    els.forEach((el) => el.classList.add("rv"));
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("rv-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);
  return null;
}
