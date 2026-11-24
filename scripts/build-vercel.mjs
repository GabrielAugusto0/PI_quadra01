// Builds the project for Vercel using the Build Output API (v3):
//   .vercel/output/static            -> front-end built by `vite build` (dist/public)
//   .vercel/output/functions/api.func -> Express + tRPC API bundled into a single file
// Run after `vite build` (see the "build:vercel" script in package.json).
import { build } from "esbuild";
import { cp, mkdir, rm, writeFile, access } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, ".vercel", "output");
const fn = path.join(out, "functions", "api.func");
const clientDist = path.join(root, "dist", "public");

await access(path.join(clientDist, "index.html")).catch(() => {
  throw new Error("dist/public/index.html not found. Run `vite build` before this script.");
});

await rm(out, { recursive: true, force: true });
await mkdir(fn, { recursive: true });

// 1) Static front-end
await cp(clientDist, path.join(out, "static"), { recursive: true });

// 2) API function: one self-contained CommonJS file (all dependencies bundled)
await build({
  entryPoints: [path.join(root, "server", "vercel.ts")],
  outfile: path.join(fn, "index.js"),
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  logLevel: "info",
  legalComments: "none",
  // Vercel's Node launcher needs the Express app itself as module.exports
  footer: { js: "module.exports = module.exports.default || module.exports;" },
});
await writeFile(path.join(fn, "package.json"), JSON.stringify({ type: "commonjs" }));
await writeFile(
  path.join(fn, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "index.js",
      launcherType: "Nodejs",
      shouldAddHelpers: false,
      maxDuration: 30,
    },
    null,
    2,
  ),
);

// 3) Routing
await writeFile(
  path.join(out, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        {
          src: "/assets/(.*)",
          headers: { "cache-control": "public, max-age=31536000, immutable" },
          continue: true,
        },
        { handle: "filesystem" },
        { src: "/api/(.*)", dest: "/api" },
        { src: "/(.*)", dest: "/index.html" },
      ],
    },
    null,
    2,
  ),
);

console.log("Vercel output ready in .vercel/output");
