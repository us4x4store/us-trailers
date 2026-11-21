import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "US Trailers",
    short_name: "US Trailers",
    description: "Custom trailers, drawn for you and built once, in Cape Town.",
    start_url: "/",
    display: "standalone",
    background_color: "#E6EAE5",
    theme_color: "#22262A",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
