import { ogCard, OG_SIZE } from "@/components/ogCard";

export const alt = "US Trailers: Toy haulers, built here.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OgImage() {
  return ogCard(["Toy haulers,", "built here."], "US Trailers · Cape Town", "UST-002");
}
