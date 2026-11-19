import type { MetadataRoute } from "next";
import { TYPES } from "@/content/types";
import { SITE_URL } from "@/content/site";

const BASE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    ...TYPES.map((t) => ({ url: `${BASE}/${t.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${BASE}/faq`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
