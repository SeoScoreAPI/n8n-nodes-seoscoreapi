"use strict";
// The published layout and n8n's loading contract (1.7.5). Runs against dist/, which the
// pretest script builds. No network, no n8n install.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const pkg = require(path.join(root, "package.json"));

// n8n's DirectoryLoader does `new (require(file)[<file name before the first dot>])()`.
function loadLikeN8n(rel) {
  const file = path.join(root, rel);
  const className = path.basename(file).split(".")[0];
  const Cls = require(file)[className];
  assert.equal(typeof Cls, "function", `${rel} must export a class named ${className}`);
  const instance = new Cls();
  // Lazy loading later requires the class by its constructor name.
  assert.equal(require(file)[instance.constructor.name], Cls, `${rel} must also export ${instance.constructor.name}`);
  return instance;
}

test("n8n paths point at the compiled dist/ output and exist", () => {
  const paths = [...pkg.n8n.nodes, ...pkg.n8n.credentials];
  assert.ok(paths.length >= 2);
  for (const p of paths) {
    assert.match(p, /^dist\//);
    assert.ok(fs.existsSync(path.join(root, p)), p);
  }
  assert.ok(pkg.files.includes("dist"));
});

test("n8n-workflow is a peer dependency", () => {
  assert.equal(pkg.peerDependencies["n8n-workflow"], "*");
});

test("n8n can load the node and the credential by file name", () => {
  const node = loadLikeN8n(pkg.n8n.nodes[0]);
  const cred = loadLikeN8n(pkg.n8n.credentials[0]);
  assert.equal(node.description.name, "seoScoreApi");
  assert.equal(cred.name, "seoScoreApi");
  assert.deepEqual(node.description.credentials.map((c) => c.name), [cred.name]);
});

test("the node icon ships next to the node", () => {
  const node = loadLikeN8n(pkg.n8n.nodes[0]);
  const icon = node.description.icon.replace(/^file:/, "");
  assert.ok(fs.existsSync(path.join(root, path.dirname(pkg.n8n.nodes[0]), icon)), icon);
});

test("the node version matches package.json", () => {
  const src = fs.readFileSync(path.join(root, pkg.n8n.nodes[0]), "utf8");
  assert.match(src, new RegExp(`const VERSION = "${pkg.version.replace(/\./g, "\\.")}"`));
});

test("no deprecated helpers.request calls ship", () => {
  for (const p of pkg.n8n.nodes) {
    const src = fs.readFileSync(path.join(root, p), "utf8");
    assert.doesNotMatch(src, /helpers\.request\s*\(/);
    assert.doesNotMatch(src, /helpers\.requestWithAuthentication\s*\(/);
  }
});

test("no timer globals ship (n8n's no-restricted-globals rule)", () => {
  for (const p of [...pkg.n8n.nodes, ...pkg.n8n.credentials]) {
    const src = fs.readFileSync(path.join(root, p), "utf8");
    assert.doesNotMatch(src, /\b(setTimeout|setInterval|setImmediate)\s*\(/);
  }
});
