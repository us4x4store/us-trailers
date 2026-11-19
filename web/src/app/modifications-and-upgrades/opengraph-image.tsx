import { ogCard, OG_SIZE } from "@/components/ogCard";

export const alt = "US Trailers: Make your trailer better.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OgImage() {
  return ogCard(["Make your trailer", "better."], "US Trailers · Cape Town", "UST-005");
}
