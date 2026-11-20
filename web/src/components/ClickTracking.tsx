"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

/** Counts the clicks that lead to an enquiry, wherever the link sits on the page. */
export default function ClickTracking() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
      if (!a) return;
      const where = a.closest("header") ? "nav" : a.closest("footer") ? "footer" : a.closest("section")?.id || location.pathname;
      if (a.href.includes("wa.me/")) track("whatsapp_click", { where: String(where) });
      else if (a.hash === "#enquire") track("get_price_click", { where: String(where), page: location.pathname });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
