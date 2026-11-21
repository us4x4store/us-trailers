import AssemblyFilm from "@/components/film/AssemblyFilm";
import TestDrive from "@/components/drive/TestDrive";
import PhotoBand from "@/components/photoband/PhotoBand";
import TypeIndex from "@/components/types/TypeIndex";
import Process from "@/components/process/Process";
import Configurator from "@/components/config/Configurator";
import FaqList from "@/components/faq/FaqList";
import TowCheck from "@/components/towcheck/TowCheck";
import Enquire from "@/components/enquire/Enquire";
import { SITE_URL } from "@/content/site";

const ORG = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "US Trailers",
  description: "Custom toy haulers, gooseneck and fifth-wheel trailers, off-road trailers and trailer modifications, built to order in Cape Town.",
  url: `${SITE_URL}/`,
  address: { "@type": "PostalAddress", addressLocality: "Cape Town", addressRegion: "Western Cape", addressCountry: "ZA" },
  areaServed: { "@type": "Country", name: "South Africa" },
  currenciesAccepted: "ZAR",
};

export const metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG) }} />
      <div id="top" />
      <div id="film">
        <AssemblyFilm />
      </div>
      <PhotoBand />
      <TestDrive />
      <TypeIndex />
      <Process />
      <Configurator />
      <TowCheck />
      <FaqList ids={["cost", "licence", "brakes", "roadworthy", "speed", "time"]} more />
      <Enquire />
    </main>
  );
}
