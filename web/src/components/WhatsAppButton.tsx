import { waLink } from "@/content/contact";

/** Floating WhatsApp button; renders only once Justin's number is set in content/contact.ts. */
export default function WhatsAppButton() {
  const href = waLink();
  if (!href) return null;
  return (
    <a
      href={href}
      aria-label="WhatsApp US Trailers"
      style={{
        position: "fixed",
        right: "max(16px, env(safe-area-inset-right, 0px))",
        bottom: "max(16px, env(safe-area-inset-bottom, 0px))",
        zIndex: 30,
        minHeight: 52,
        padding: "0 18px",
        display: "inline-grid",
        placeItems: "center",
        background: "var(--ink)",
        color: "var(--paper)",
        font: "600 12px/1 var(--mono)",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        textDecoration: "none",
        boxShadow: "0 8px 20px -10px rgba(0,0,0,.5)",
      }}
    >
      WhatsApp us
    </a>
  );
}
