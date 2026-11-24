import * as esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const web = path.resolve(here, "../..");
await esbuild.build({
  entryPoints: [path.join(here, "islands.tsx")],
  bundle: true,
  format: "iife",
  minify: true,
  target: "es2020",
  outfile: path.join(here, "dist/islands.js"),
  jsx: "automatic",
  loader: { ".module.css": "local-css", ".json": "json" },
  define: { "process.env.NODE_ENV": '"production"' },
  alias: { "next/dynamic": path.join(here, "next-dynamic.tsx"), "@vercel/analytics": path.join(here, "analytics.ts"), "@": path.join(web, "src") },
  tsconfig: path.join(web, "tsconfig.json"),
  logLevel: "warning",
});
console.log("built");
