import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";
import { decodeBuild } from "@/trailer/pricing";
import { trailerScene } from "@/trailer/exportModel";

// GLTFExporter's binary path uses FileReader, which Node doesn't have.
class NodeFileReader {
  result: ArrayBuffer | string | null = null;
  onload: ((e: { target: NodeFileReader }) => void) | null = null;
  onloadend: (() => void) | null = null;
  readAsArrayBuffer(b: Blob) {
    b.arrayBuffer().then((r) => {
      this.result = r;
      this.onload?.({ target: this });
      this.onloadend?.();
    });
  }
  readAsDataURL(b: Blob) {
    b.arrayBuffer().then((r) => {
      this.result = `data:${b.type || "application/octet-stream"};base64,${Buffer.from(r).toString("base64")}`;
      this.onload?.({ target: this });
      this.onloadend?.();
    });
  }
}
const g = globalThis as unknown as { FileReader?: unknown };
g.FileReader ??= NodeFileReader;

/**
 * AR file for a build code, e.g. /api/ar/L48-A2-C0-R1-S1.usdz (iPhone Quick Look)
 * or /api/ar/L48-A2-C0-R1-S1.glb (Android Scene Viewer). Same code, same file, forever.
 */
export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const m = /^(.+)\.(glb|usdz)$/.exec(file);
  const cfg = m && decodeBuild(m[1]);
  if (!m || !cfg) return new Response("Unknown build code", { status: 404 });
  const scene = trailerScene(cfg);
  const body =
    m[2] === "glb"
      ? new Uint8Array((await new GLTFExporter().parseAsync(scene, { binary: true })) as ArrayBuffer)
      : await new USDZExporter().parseAsync(scene);
  return new Response(body as BodyInit, {
    headers: {
      "Content-Type": m[2] === "glb" ? "model/gltf-binary" : "model/vnd.usdz+zip",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="us-trailers-${m[1]}.${m[2]}"`,
    },
  });
}
