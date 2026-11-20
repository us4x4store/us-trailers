"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TYPES } from "@/content/types";
import { sound } from "@/lib/sound";
import styles from "./nav.module.css";

const LINKS = [
  { href: "/#film", label: "The build" },
  { href: "/#types", label: "Trailers" },
  { href: "/#design", label: "Design yours" },
  { href: "/faq", label: "Towing laws" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  useEffect(() => {
    const off = sound.subscribe(setAudioOn);
    sound.init();
    return off;
  }, []);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    window.dispatchEvent(new Event("lenis:stop"));
    document.querySelector<HTMLAnchorElement>("#menu a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      window.dispatchEvent(new Event("lenis:start"));
      document.querySelector<HTMLButtonElement>("[aria-controls=menu]")?.focus();
    };
  }, [open]);

  return (
    <header className={styles.nav}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <a href="/" className={styles.wm} aria-label="US Trailers, home">
        US·TRAILERS
        <i aria-hidden="true" />
      </a>
      <nav className={styles.links} aria-label="Main">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      <div className={styles.right}>
        <button type="button" className={styles.sound} aria-pressed={audioOn} onClick={() => sound.set(!audioOn)}>
          <span aria-hidden="true" className={styles.wave} data-on={audioOn || undefined}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.soundLabel}>{audioOn ? "Sound on" : "Sound off"}</span>
        </button>
        <a href="/#enquire" className={styles.wa}>
          Get a price
        </a>
        <button type="button" className={styles.burger} aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>
          <span>{open ? "Close" : "Menu"}</span>
          <b aria-hidden="true">
            <i />
            <i />
          </b>
        </button>
      </div>
      <div id="menu" className={styles.menu} hidden={!open} role="dialog" aria-modal="true" aria-label="Menu">
        <nav aria-label="Menu">
          <p className={styles.mh}>Site</p>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="/#drive" onClick={() => setOpen(false)}>
            Tow it
          </a>
          <p className={styles.mh}>Trailers</p>
          {TYPES.map((t) => (
            <a key={t.slug} href={`/${t.slug}`} onClick={() => setOpen(false)}>
              {t.short}
            </a>
          ))}
          <a className={styles.menuCta} href="/#enquire" onClick={() => setOpen(false)}>
            Get a price
          </a>
          <button type="button" className={styles.menuClose} onClick={() => setOpen(false)}>
            Close menu
          </button>
        </nav>
      </div>
    </header>
  );
}
