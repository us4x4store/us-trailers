/** Scroll to the enquiry and put keyboard and screen-reader focus on its heading. */
export function goToEnquiry() {
  const sec = document.getElementById("enquire");
  if (!sec) return;
  sec.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  const h = sec.querySelector<HTMLElement>("h2");
  if (h) {
    h.tabIndex = -1;
    h.focus({ preventScroll: true });
  }
}
