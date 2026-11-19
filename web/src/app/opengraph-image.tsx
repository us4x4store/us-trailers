import { ogCard, OG_SIZE } from "@/components/ogCard";

export const alt = "US Trailers: custom trailers drawn for you and built once, in Cape Town";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OgImage() {
  return ogCard(["Drawn for you.", "Built once."]);
}
