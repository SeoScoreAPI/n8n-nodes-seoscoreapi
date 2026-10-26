"use strict";
// Operations added in 1.6.0, run against a fake n8n execute context. No network.
const test = require("node:test");
const assert = require("node:assert/strict");
const { SeoScoreApi, run, legacyOperations } = require("./helpers");
const B = "https://seoscoreapi.com";

// [operation params, method, path, expected qs, expected body]
const CASES = [
  [{ operation: "competitiveAudit", competitiveUrl: "https://a.com", competitorUrl: "https://b.com", keyword: "crm" },
    "POST", "/audit/competitive", undefined, { url: "https://a.com", competitor_url: "https://b.com", keyword: "crm" }],
  [{ operation: "accessibilityAudit", targetUrl: "https://e.com" }, "GET", "/audit/accessibility", { url: "https://e.com" }],
  [{ operation: "accessibilityAudit", targetUrl: "https://e.com", includeTrackers: true }, "GET", "/audit/accessibility",
    { url: "https://e.com", include: "trackers" }],
  [{ operation: "aiReadability", targetUrl: "https://e.com" }, "GET", "/ai-readability", { url: "https://e.com" }],
  [{ operation: "trackers", targetUrl: "https://e.com" }, "GET", "/trackers", { url: "https://e.com" }],
  [{ operation: "conversion", targetUrl: "https://e.com", pageType: "" }, "GET", "/conversion", { url: "https://e.com" }],
  [{ operation: "conversion", targetUrl: "https://e.com", pageType: "saas" }, "GET", "/conversion", { url: "https://e.com", page_type: "saas" }],
  [{ operation: "quickWins", quickWinsSource: "csv", quickWinsCsv: "Query,Clicks\nq,1", quickWinsOptions: '{"limit": 5}' },
    "POST", "/quick-wins", undefined, { limit: 5, csv: "Query,Clicks\nq,1" }],
  [{ operation: "quickWins", quickWinsSource: "rows", quickWinsRows: '[{"query":"q","position":11.4}]' },
    "POST", "/quick-wins", undefined, { rows: [{ query: "q", position: 11.4 }] }],
  [{ operation: "backlinks", domain: "e.com", backlinksLimit: 10 }, "GET", "/backlinks", { domain: "e.com", limit: 10 }],
  [{ operation: "geoAudit", targetUrl: "https://e.com" }, "GET", "/geo/audit", { url: "https://e.com" }],
  [{ operation: "geoBrandProbe", brand: "Acme", brandDomain: "acme.com", prompts: "best crm\n\nbest crm for agencies ", models: "claude, nova", runsPerPrompt: 2 },
    "POST", "/geo/brand-probe", undefined,
    { brand: "Acme", domain: "acme.com", prompts: ["best crm", "best crm for agencies"], models: ["claude", "nova"], runs_per_prompt: 2 }],
  [{ operation: "addGeoMonitor", targetUrl: "https://e.com" }, "POST", "/geo/monitor", undefined,
    { url: "https://e.com", frequency: "weekly", alert_threshold: -5 }],
  [{ operation: "listGeoMonitors" }, "GET", "/geo/monitors"],
  [{ operation: "geoMonitorHistory", geoMonitorId: 7, page: 2 }, "GET", "/geo/monitor/7/history", { page: 2, per_page: 20 }],
  [{ operation: "removeGeoMonitor", targetUrl: "https://e.com" }, "DELETE", "/geo/monitor", undefined, { url: "https://e.com" }],
  [{ operation: "startCrawl", targetUrl: "https://e.com", maxPages: 0 }, "POST", "/crawl", undefined, { url: "https://e.com" }],
  [{ operation: "startCrawl", targetUrl: "https://e.com", maxPages: 10 }, "POST", "/crawl", undefined, { url: "https://e.com", max_pages: 10 }],
  [{ operation: "getCrawl", crawlJobId: "abc" }, "GET", "/crawl/abc"],
  [{ operation: "citationStarterPrompts", starterTopic: "CRM", brand: "Acme", citationCompetitors: "A, B", promptLimit: 15 },
    "GET", "/citations/prompts/starter", { topic: "CRM", brand: "Acme", competitors: "A,B", per_category: 2, limit: 15 }],
  [{ operation: "citationSuggestPrompts", domain: "e.com" }, "GET", "/citations/prompts/suggest", { domain: "e.com" }],
  [{ operation: "createCitationTracker", brand: "Acme", citationDomains: "acme.com", prompts: "best crm\nbest crm for agencies", citationEngines: ["chatgpt"], citationSamples: 3, citationCadence: "weekly" },
    "POST", "/citations/trackers", undefined,
    { brand: "Acme", domains: ["acme.com"], engines: ["chatgpt"], samples: 3, prompts: ["best crm", "best crm for agencies"], cadence: "weekly" }],
  [{ operation: "createCitationTracker", brand: "Acme", prompts: "", starterTopic: "CRM", starterAudience: "agencies" },
    "POST", "/citations/trackers", undefined, { brand: "Acme", starter: { topic: "CRM", audience: "agencies" } }],
  [{ operation: "listCitationTrackers" }, "GET", "/citations/trackers"],
  [{ operation: "getCitationTracker", trackerId: 3 }, "GET", "/citations/trackers/3"],
  [{ operation: "updateCitationTracker", trackerId: 3, trackerUpdateFields: '{"cadence":"monthly"}' }, "PATCH", "/citations/trackers/3", undefined, { cadence: "monthly" }],
  [{ operation: "updateCitationTracker", trackerId: 3, trackerUpdateFields: { samples: 2 } }, "PATCH", "/citations/trackers/3", undefined, { samples: 2 }],
  [{ operation: "deleteCitationTracker", trackerId: 3 }, "DELETE", "/citations/trackers/3"],
  [{ operation: "runCitationTracker", trackerId: 3 }, "POST", "/citations/trackers/3/run"],
  [{ operation: "getCitationRun", runId: 9 }, "GET", "/citations/runs/9"],
  [{ operation: "citationTrackerHistory", trackerId: 3, historyDays: 30 }, "GET", "/citations/trackers/3/history", { days: 30 }],
  [{ operation: "citationCheck", brand: "Acme", citationPrompt: "best crm", citationCompetitors: "Rival" },
    "POST", "/citations/check", undefined, { brand: "Acme", competitors: ["Rival"], prompt: "best crm" }],
  [{ operation: "citationTopups" }, "GET", "/citations/topups"],
  [{ operation: "citationTopupCheckout", topupPack: 500 }, "POST", "/citations/topups/checkout", undefined, { pack: "500" }],
  [{ operation: "citationAutoReload" }, "GET", "/citations/auto-reload"],
];

CASES.forEach(([params, method, path, qs, body], n) => {
  test(`#${n} ${params.operation} -> ${method} ${path}`, async () => {
    const { out, calls } = await run(params, [{ ok: 1 }]);
    assert.deepEqual(out, [{ ok: 1 }]);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, method);
    assert.equal(calls[0].url, B + path);
    assert.equal(calls[0].credentialType, "seoScoreApi");
    assert.deepEqual(calls[0].qs, qs);
    assert.deepEqual(calls[0].body, body);
  });
});

test("every operation in the dropdown is handled", async () => {
  const ops = legacyOperations();
  assert.equal(new Set(ops).size, ops.length, "duplicate operation value");
  for (const operation of ops) {
    // A finished job for every request, so the waiting operations return on the first poll.
    const responses = Array.from({ length: 4 }, () => ({ job_id: "abc", status: "completed", result: { ok: 1 } }));
    const params = { operation, urls: "https://a.com", compareUrls: "https://a.com,https://b.com" };
    const { out, calls } = await run(params, operation === "exportAudit" ? [Buffer.from("x")] : responses);
    assert.ok(calls.length >= 1, `${operation} made no request`);
    assert.notEqual(out[0], undefined, `${operation} returned nothing`);
  }
});

test("every field is shown for at least one real operation", () => {
  const props = new SeoScoreApi().description.properties;
  const ops = new Set(legacyOperations());
  for (const p of props.filter((x) => x.name !== "operation" && x.name !== "resource")) {
    for (const op of p.displayOptions.show.operation) assert.ok(ops.has(op), `${p.name} -> ${op}`);
  }
});

test("Export Audit Report returns the file as binary data", async () => {
  const pdf = Buffer.from("%PDF-1.7 report");
  const { items, calls } = await run(
    { operation: "exportAudit", targetUrl: "https://example.com/pricing", exportFormat: "pdf", brandName: "Acme", brandColor: "", logoUrl: "" },
    [pdf],
  );
  assert.equal(calls[0].url, `${B}/audit/export`);
  assert.deepEqual(calls[0].qs, { url: "https://example.com/pricing", format: "pdf", brand_name: "Acme" });
  assert.equal(calls[0].encoding, "arraybuffer");
  assert.equal(calls[0].json, false);
  assert.deepEqual(items[0].binary.data, { data: pdf.toString("base64"), fileName: "seo-report-example.com.pdf", mimeType: "application/pdf" });
  assert.deepEqual(items[0].json, { url: "https://example.com/pricing", format: "pdf", fileName: "seo-report-example.com.pdf", bytes: pdf.length });
});

test("Export Audit Report honours the format and the binary field name", async () => {
  const { items } = await run(
    { operation: "exportAudit", targetUrl: "example.com", exportFormat: "csv", binaryPropertyName: "report" },
    [Buffer.from("a,b")],
  );
  assert.equal(items[0].binary.report.mimeType, "text/csv");
  assert.equal(items[0].binary.report.fileName, "seo-report-example.com.csv");
});

test("Generate llms.txt returns the text", async () => {
  const { out, calls } = await run({ operation: "llmsTxt", domain: "e.com" }, ["# Example\n"]);
  assert.deepEqual(out, [{ domain: "e.com", llms_txt: "# Example\n" }]);
  assert.equal(calls[0].url, `${B}/llms-generator`);
  assert.equal(calls[0].json, false);
});

test("Crawl Site starts, polls and returns the completed job", async () => {
  const { out, calls } = await run(
    { operation: "crawl", targetUrl: "https://e.com", maxPages: 5 },
    [{ job_id: "abc", status: "queued" }, { status: "running", pages_done: 2 }, { status: "completed", site_map: "m", result: { summary: {} } }],
  );
  assert.deepEqual(out, [{ status: "completed", site_map: "m", result: { summary: {} } }]);
  assert.deepEqual(calls[0].body, { url: "https://e.com", max_pages: 5 });
  assert.equal(calls[2].url, `${B}/crawl/abc`);
});

test("Crawl Site surfaces a failed crawl", async () => {
  await assert.rejects(
    run({ operation: "crawl", targetUrl: "https://e.com" }, [{ job_id: "abc" }, { status: "failed", error: "boom" }]),
    /boom/,
  );
});

test("invalid JSON in a JSON field is a clear error", async () => {
  await assert.rejects(run({ operation: "updateCitationTracker", trackerId: 3, trackerUpdateFields: "{nope" }, [{}]), /Fields to Update must be valid JSON/);
});

test("auto-reload has only the read operation", () => {
  const ops = legacyOperations();
  assert.deepEqual(ops.filter((o) => /autoreload/i.test(o)), ["citationAutoReload"]);
});

// --- Core Web Vitals opt-in (1.7.0) ---

test("Include Core Web Vitals is an off-by-default switch on Audit URL and Batch Audit", () => {
  const prop = new SeoScoreApi().description.properties.find((p) => p.name === "includeCoreWebVitals");
  assert.equal(prop.type, "boolean");
  assert.equal(prop.default, false);
  assert.deepEqual(prop.displayOptions.show.operation, ["audit", "batchAudit"]);
});

test("Audit URL sends cwv only when the switch is on", async () => {
  const off = await run({ operation: "audit", url: "https://e.com" }, [{ score: 90 }]);
  assert.equal(off.calls[0].url, `${B}/audit`);
  assert.deepEqual(off.calls[0].qs, { url: "https://e.com" });
  const on = await run({ operation: "audit", url: "https://e.com", includeCoreWebVitals: true },
    [{ score: 90, core_web_vitals: { status: "ok", lcp_ms: 1800 } }]);
  assert.deepEqual(on.calls[0].qs, { url: "https://e.com", cwv: "true" });
  assert.equal(on.out[0].core_web_vitals.lcp_ms, 1800);
});

test("Batch Audit sends cwv only when the switch is on", async () => {
  const off = await run({ operation: "batchAudit", urls: "https://a.com, https://b.com" }, [{ count: 2, results: [] }]);
  assert.deepEqual(off.calls[0].body, { urls: ["https://a.com", "https://b.com"] });
  const on = await run({ operation: "batchAudit", urls: "https://a.com", includeCoreWebVitals: true }, [{ count: 1, results: [] }]);
  assert.deepEqual(on.calls[0].body, { urls: ["https://a.com"], cwv: true });
});
