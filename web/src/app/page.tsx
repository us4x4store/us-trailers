import AssemblyFilm from "@/components/film/AssemblyFilm";
import TestDrive from "@/components/drive/TestDrive";
import Configurator from "@/components/config/Configurator";
import Enquire from "@/components/enquire/Enquire";

export default function Home() {
  return (
    <main id="main">
      <div id="top" />
      <div id="film">
        <AssemblyFilm />
      </div>
      <TestDrive />
      <Configurator />
      <Enquire />
    </main>
  );
}
