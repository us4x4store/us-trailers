"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { waLink } from "@/content/contact";
import { track } from "@/lib/track";
import styles from "./dock.module.css";

/**
 * Phones: a two-button dock (WhatsApp + Get a price) once the visitor is past the film.
 * It steps aside wherever a section shows its own price bar, and over the form itself.
 * Laptops: the single WhatsApp button, bottom right.
 */
export default function Dock() {
  const path = usePathname();
  const [covered, setCovered] = useState(true);
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(max-width: 760px)");
    const f = () => setPhone(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  // only phones step aside; the laptop button stays put
  const hidden = phone && covered;
  const wa = waLink();

  useEffect(() => {
    const seen = new Map<Element, boolean>();
    const update = () => setCovered([...seen.values()].some(Boolean));
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => seen.set(e.target, e.isIntersecting));
        update();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    const watch = () => {
      io.disconnect();
      seen.clear();
      document.querySelectorAll("#film, #enquire, [data-own-dock], footer").forEach((el) => {
        seen.set(el, false);
        io.observe(el);
      });
      update();
    };
    watch();
    const t = setTimeout(watch, 1500); // sections that mount late (designer, tow checker)
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [path]);

  if (!wa) return null;
  return (
    <div className={`${styles.dock} ${hidden ? styles.hide : ""}`} inert={hidden}>
      <a className={styles.wa} href={wa} onClick={() => track("whatsapp_click", { from: "dock" })} aria-label="WhatsApp US Trailers">
        WhatsApp us
      </a>
      <a className={styles.price} href="/#enquire" onClick={() => track("get_price_click", { from: "dock" })}>
        Get a price
      </a>
    </div>
  );
}
