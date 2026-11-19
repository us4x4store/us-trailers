import AssemblyFilm from "@/components/film/AssemblyFilm";
import TestDrive from "@/components/drive/TestDrive";

export default function Home() {
  return (
    <main id="main">
      <div id="top" />
      <div id="film">
        <AssemblyFilm />
      </div>
      <TestDrive />
    </main>
  );
}
