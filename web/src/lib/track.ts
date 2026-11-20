import { track as vercelTrack } from "@vercel/analytics";

/**
 * Every conversion event goes through here, so a second analytics tool can be added in one place.
 * Note: Vercel records custom events on Pro plans; on Hobby these calls are ignored.
 */
export type EventName = "enquiry_submitted" | "build_shared" | "ar_opened" | "tow_check" | "film_finished" | "rig_driven" | "whatsapp_click" | "get_price_click" | "teardown";

export function track(name: EventName, props?: Record<string, string | number | boolean>) {
  try {
    vercelTrack(name, props);
  } catch {
    /* analytics must never break the page */
  }
}
