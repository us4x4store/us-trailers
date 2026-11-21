import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Dock from "@/components/Dock";
import { Analytics } from "@vercel/analytics/next";
import ClickTracking from "@/components/ClickTracking";
import { SITE_URL } from "@/content/site";
import "./globals.css";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"], display: "swap" });
const plex = IBM_Plex_Mono({ variable: "--font-plex", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "US Trailers | Bespoke Texan-style toy haulers, Cape Town",
  description:
    "Bespoke Texan-style toy haulers for ATVs, side-by-sides and bikes: V-nose, gloss paint, polished aluminium and RGB lighting. Drawn for you and built one at a time in Cape Town.",
  openGraph: { locale: "en_ZA", type: "website", siteName: "US Trailers" },
};

export const viewport: Viewport = { themeColor: "#E6EAE5", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" className={`${archivo.variable} ${plex.variable}`}>
      <body>
        <SmoothScroll />
        <Nav />
        {children}
        <Footer />
        <Dock />
        <Analytics />
        <ClickTracking />
      </body>
    </html>
  );
}
