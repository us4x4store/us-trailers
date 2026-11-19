import { ogCard, OG_SIZE } from "@/components/ogCard";

export const alt = "US Trailers: Goosenecks & fifth-wheels.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OgImage() {
  return ogCard(["Goosenecks &", "fifth-wheels."], "US Trailers · Cape Town", "UST-003");
}
