"use strict";
// Build the published package into dist/, the layout n8n's community-node checks expect.
// The source is TypeScript in the starter layout (credentials/*.credentials.ts,
// nodes/**/*.node.ts): n8n's Creator Portal maps package.json's dist/<dir>/X.js back to
// <dir>/X.ts in the repository, so the .ts files must be there. tsc compiles them to dist/
// at the same relative paths; this script then copies the icons (icons/, plus any next to
// a node or credential) and checks that every path package.json declares to n8n exists.
// `npm test` (pretest) and `npm pack` / `npm publish` (prepack) run it; it needs the
// dev dependencies installed (`npm ci`).
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const ASSETS = new Set([".svg", ".png", ".json"]);

fs.rmSync(dist, { recursive: true, force: true });

let tsc;
try {
  tsc = require.resolve("typescript/bin/tsc", { paths: [root] });
} catch {
  console.error("build: typescript is not installed; run `npm ci` first");
  process.exit(1);
}
const res = spawnSync(process.execPath, [tsc, "-p", path.join(root, "tsconfig.json")], { stdio: "inherit" });
if (res.status !== 0) process.exit(res.status || 1);

function copyAssets(src, dest) {
  for (const name of fs.readdirSync(src)) {
    const from = path.join(src, name);
    const to = path.join(dest, name);
    if (fs.statSync(from).isDirectory()) copyAssets(from, to);
    else if (ASSETS.has(path.extname(name))) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
    }
  }
}
for (const dir of ["icons", "nodes", "credentials"]) copyAssets(path.join(root, dir), path.join(dist, dir));

// Every path package.json declares to n8n must exist in the build, and each must have its
// TypeScript source at the matching repository path (what the Creator Portal looks for).
const pkg = require(path.join(root, "package.json"));
for (const file of [...pkg.n8n.nodes, ...pkg.n8n.credentials, pkg.main]) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`build: ${file} is declared in package.json but missing from the build`);
    process.exit(1);
  }
}
for (const file of [...pkg.n8n.nodes, ...pkg.n8n.credentials]) {
  const source = file.replace(/^dist\//, "").replace(/\.js$/, ".ts");
  if (!fs.existsSync(path.join(root, source))) {
    console.error(`build: ${file} has no source at ${source}`);
    process.exit(1);
  }
}
console.log(`build: dist/ ready (${pkg.name} ${pkg.version})`);
