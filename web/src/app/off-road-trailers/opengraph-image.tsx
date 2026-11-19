import { ogCard, OG_SIZE } from "@/components/ogCard";

export const alt = "US Trailers: Off-road trailers, drawn for your route.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OgImage() {
  return ogCard(["Off-road trailers,", "drawn for your route."], "US Trailers · Cape Town", "UST-004");
}
