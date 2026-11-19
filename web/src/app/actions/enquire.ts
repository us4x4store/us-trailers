"use server";

import { z } from "zod";
import { decodeBuild, priceRange, rand, specs, COLOURS } from "@/trailer/pricing";

const Schema = z.object({
  name: z.string().trim().min(2, "Tell us your name.").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s()-]{8,18}$/, "Add a phone or WhatsApp number we can reach you on, e.g. 082 123 4567."),
  email: z.union([z.literal(""), z.string().trim().email("That email address doesn't look complete.")]),
  town: z.string().trim().max(60).optional().default(""),
  vehicle: z.string().trim().max(80).optional().default(""),
  licence: z.enum(["B", "EB", "C1/EC1", "Not sure"]).default("Not sure"),
  use: z.string().trim().max(60).optional().default(""),
  timeline: z.enum(["As soon as possible", "Within 3 months", "Within 6 months", "Just planning"]).default("Just planning"),
  message: z.string().trim().max(2000).optional().default(""),
  build: z.string().trim().max(40).optional().default(""),
  consent: z.literal("on", { message: "Please agree so we can contact you about your trailer." }),
  // spam traps
  company: z.string().max(0).optional().default(""),
  t: z.coerce.number(),
});

export type EnquiryState = { status: "idle" | "sent" | "error" | "offline"; errors?: Record<string, string>; message?: string; summary?: string };

export async function sendEnquiry(_: EnquiryState, form: FormData): Promise<EnquiryState> {
  const parsed = Schema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { status: "error", errors };
  }
  const d = parsed.data;
  // bots fill hidden fields or submit within 3 s of the form appearing
  if (d.company || Date.now() - d.t < 3000) return { status: "sent" };

  const cfg = decodeBuild(d.build);
  let buildText = "No build attached.";
  if (cfg) {
    const s = specs(cfg);
    const [lo, hi] = priceRange(cfg);
    buildText = [
      `Build ${d.build}`,
      `Body ${s.bodyMm} mm, overall ${s.overallMm} mm, ${cfg.axles === 2 ? "tandem" : "single"} axle`,
      `Colour ${COLOURS.find((c) => c.hex === cfg.colour)?.name ?? cfg.colour}; roof rack ${cfg.rack ? "yes" : "no"}; solar ${cfg.solar ? "yes" : "no"}`,
      `Tare ${s.tare} kg, GVM ${s.gvm} kg, licence ${s.licence}`,
      `Indicative ${rand(lo)} – ${rand(hi)}`,
    ].join("\n");
  }
  const summary = [
    `Name: ${d.name}`,
    `Phone/WhatsApp: ${d.phone}`,
    `Email: ${d.email || "-"}`,
    `Town: ${d.town || "-"}`,
    `Tow vehicle: ${d.vehicle || "-"}`,
    `Licence: ${d.licence}`,
    `Use: ${d.use || "-"}`,
    `Timeline: ${d.timeline}`,
    "",
    buildText,
    "",
    d.message || "(no message)",
  ].join("\n");

  // Email via Resend once ENQUIRY_TO and RESEND_API_KEY are set on Vercel (pending Justin's address).
  const to = process.env.ENQUIRY_TO;
  const key = process.env.RESEND_API_KEY;
  if (!to || !key) {
    console.warn("[enquiry] inbox not connected; enquiry not delivered", { name: d.name, build: d.build });
    return { status: "offline", summary };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ENQUIRY_FROM ?? "US Trailers <enquiries@ustrailers.co.za>",
      to: [to],
      reply_to: d.email || undefined,
      subject: `New trailer enquiry: ${d.name}${cfg ? ` (${d.build})` : ""}`,
      text: summary,
    }),
  });
  if (!res.ok) {
    console.error("[enquiry] send failed", res.status, await res.text().catch(() => ""));
    return { status: "offline", summary };
  }
  return { status: "sent" };
}
