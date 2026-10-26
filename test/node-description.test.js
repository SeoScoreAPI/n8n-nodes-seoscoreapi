"use strict";
// Node and credential descriptions (1.8.0: TypeScript port, resource grouping). No network.
const test = require("node:test");
const assert = require("node:assert/strict");
const { SeoScoreApi, SeoScoreApiCredentials, run, legacyOperations } = require("./helpers");

const props = () => new SeoScoreApi().description.properties;

test("node keeps its name and adds version 2 as the default", () => {
  const d = new SeoScoreApi().description;
  assert.equal(d.name, "seoScoreApi");
  assert.deepEqual(d.version, [1, 2]);
  assert.equal(d.defaultVersion, 2);
  assert.deepEqual(d.credentials.map((c) => c.name), ["seoScoreApi"]);
});

test("version 1 keeps the flat Operation list with default audit", () => {
  const legacy = props().filter((p) => p.name === "operation" && p.displayOptions.show["@version"][0] === 1);
  assert.equal(legacy.length, 1);
  assert.equal(legacy[0].default, "audit");
  assert.equal(legacy[0].options.length, 43);
  assert.ok(!props().find((p) => p.name === "resource").displayOptions.show["@version"].includes(1));
});

test("version 2 groups the same operation values by resource, each exactly once", () => {
  const resource = props().find((p) => p.name === "resource");
  const resources = resource.options.map((o) => o.value);
  const grouped = props().filter((p) => p.name === "operation" && p.displayOptions.show.resource);
  assert.deepEqual(grouped.map((p) => p.displayOptions.show.resource[0]).sort(), [...resources].sort());
  const values = grouped.flatMap((p) => p.options.map((o) => o.value));
  assert.equal(new Set(values).size, values.length, "an operation is in two resources");
  assert.deepEqual([...values].sort(), [...legacyOperations()].sort());
  for (const p of grouped) assert.ok(p.options.some((o) => o.value === p.default), `${p.displayOptions.show.resource} default`);
  assert.ok(resources.includes(resource.default));
});

test("credential authenticates with the X-API-Key header and tests against /usage", () => {
  const c = new SeoScoreApiCredentials();
  assert.equal(c.name, "seoScoreApi");
  assert.deepEqual(c.authenticate, { type: "generic", properties: { headers: { "X-API-Key": "={{$credentials.apiKey}}" } } });
  assert.deepEqual(c.test.request, { baseURL: "https://seoscoreapi.com", url: "/usage", method: "GET" });
  assert.equal(c.properties.find((p) => p.name === "apiKey").typeOptions.password, true);
});

test("Export Audit Report accepts an ArrayBuffer body", async () => {
  const bytes = new TextEncoder().encode("a,b").buffer;
  const { items } = await run({ operation: "exportAudit", targetUrl: "https://e.com", exportFormat: "csv" }, [bytes]);
  assert.equal(items[0].json.bytes, 3);
  assert.equal(items[0].binary.data.mimeType, "text/csv");
});

test("output items are paired with their input item", async () => {
  const { items } = await run({ operation: "usage" }, [{ tier: "free" }]);
  assert.deepEqual(items[0].pairedItem, { item: 0 });
});

test("Continue On Fail returns the error as an item", async () => {
  const { out } = await run({ operation: "usage" }, [new Error("Forbidden")], undefined, { continueOnFail: true });
  assert.match(out[0].error, /Forbidden/);
});

test("a failed request is raised as a NodeApiError", async () => {
  await assert.rejects(run({ operation: "usage" }, [new Error("socket hang up")]), (e) => e.name === "NodeApiError");
});
