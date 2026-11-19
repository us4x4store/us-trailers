/**
 * Contact details. PENDING from Justin (questions batch 1, Q12).
 * Fill these in and the WhatsApp button, phone and email links appear across the site.
 */
export const CONTACT = {
  /** international format without "+" or spaces, e.g. "27821234567" */
  whatsapp: "" as string,
  /** as shown to people, e.g. "082 123 4567" */
  phone: "" as string,
  email: "" as string,
};

export const waLink = (text = "Hi US Trailers, I'd like a price on a custom trailer.") =>
  CONTACT.whatsapp ? `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}` : null;
export const telLink = () => (CONTACT.phone ? `tel:+27${CONTACT.phone.replace(/\D/g, "").replace(/^0/, "")}` : null);
