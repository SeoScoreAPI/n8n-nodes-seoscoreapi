"use strict";
// Build the published package into dist/, the layout n8n's community-node checks expect
// (package.json n8n.nodes / n8n.credentials point at dist/...). The source is plain
// JavaScript, so building is a copy: index.js, credentials/ and nodes/ (with icons) go to
// dist/ at the same relative paths. No dependencies, so `npm publish` (prepack) and
// `npm test` (pretest) run it without an install step.
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const COPY = ["index.js", "credentials", "nodes"];
const EXT = new Set([".js", ".json", ".svg", ".png"]);

function copy(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(src)) copy(path.join(src, name), path.join(dest, name));
  } else if (EXT.has(path.extname(src))) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

fs.rmSync(dist, { recursive: true, force: true });
for (const entry of COPY) copy(path.join(root, entry), path.join(dist, entry));

// Every path package.json declares to n8n must exist in the build.
const pkg = require(path.join(root, "package.json"));
for (const file of [...pkg.n8n.nodes, ...pkg.n8n.credentials, pkg.main]) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`build: ${file} is declared in package.json but missing from the build`);
    process.exit(1);
  }
}
console.log(`build: dist/ ready (${pkg.name} ${pkg.version})`);
