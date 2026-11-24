// The site's own interactive components, packed to run inside the saved single-file copy:
// the 3D designer, the build timeline and the tow checker. Each mounts where the export left a slot.
import { createRoot } from "react-dom/client";
import Configurator from "@/components/config/Configurator";
import Process from "@/components/process/Process";
import TowCheck from "@/components/towcheck/TowCheck";

const mounts: [string, () => React.ReactElement][] = [
  ["island-design", () => <Configurator />],
  ["island-process", () => <Process />],
  ["island-towcheck", () => <TowCheck id="faq-tow-check" />],
];
for (const [id, el] of mounts) {
  const host = document.getElementById(id);
  if (host) createRoot(host).render(el());
}
