import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import "./globals.css";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"], display: "swap" });
const plex = IBM_Plex_Mono({ variable: "--font-plex", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://ustrailers.co.za"),
  title: "US Trailers | Custom trailers built in Cape Town",
  description:
    "Bespoke toy haulers, off-road campers and gooseneck trailers, designed around your vehicle, licence code and load, and built one at a time in Cape Town.",
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
      </body>
    </html>
  );
}
