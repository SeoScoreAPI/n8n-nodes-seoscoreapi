"use strict";
// Deep Audit operations of the n8n node, run against a fake n8n execute context.
const test = require("node:test");
const assert = require("node:assert/strict");
const { SeoScoreApi, SeoScoreApiCredentials } = require("..");

SeoScoreApi.pollIntervalMs = 1;

function run(params, responses, credentials = { apiKey: "k" }) {
  const calls = [];
  const queue = [...responses];
  const ctx = {
    getInputData: () => [{ json: {} }],
    getNodeParameter: (name, _i, fallback) => (name in params ? params[name] : fallback),
    getCredentials: async () => credentials,
    helpers: {
      request: async (opts) => {
        calls.push(opts);
        const next = queue.shift();
        if (next instanceof Error) throw next;
        return next;
      },
    },
  };
  const node = new SeoScoreApi();
  return node.execute.call(ctx).then((out) => ({ out: out[0].map((x) => x.json), calls }));
}

test("credential exposes a Deep Audit base URL defaulting to the main host", () => {
  const prop = new SeoScoreApiCredentials().properties.find((p) => p.name === "deepAuditBaseUrl");
  assert.equal(prop.default, "https://seoscoreapi.com");
});

test("Deep Audit starts and polls on the main host", async () => {
  const { out, calls } = await run(
    { operation: "deepAudit", deepAuditUrl: "https://example.com", businessType: "saas" },
    [{ job_id: "abc", status: "queued" }, { status: "running" }, { status: "completed", result: { ok: 1 } }],
  );
  assert.deepEqual(out, [{ ok: 1 }]);
  assert.equal(calls[0].method, "POST");
  assert.equal(calls[0].url, "https://seoscoreapi.com/site-audit");
  assert.deepEqual(calls[0].body, { url: "https://example.com", business_type: "saas" });
  assert.equal(calls[2].url, "https://seoscoreapi.com/site-audit/abc");
  assert.equal(calls[0].headers["User-Agent"], "seoscoreapi-n8n/1.5.0");
});

test("Deep Audit surfaces a failed job", async () => {
  await assert.rejects(
    run({ operation: "deepAudit", deepAuditUrl: "https://example.com", businessType: "" },
      [{ job_id: "abc" }, { status: "failed", error: "boom" }]),
    /boom/,
  );
});

test("Start Deep Audit returns the job and sends the webhook", async () => {
  const { out, calls } = await run(
    { operation: "startDeepAudit", deepAuditUrl: "https://example.com", businessType: "", deepAuditWebhookUrl: "https://hook.example/x" },
    [{ job_id: "abc", status: "queued", poll: "/site-audit/abc" }],
  );
  assert.equal(out[0].job_id, "abc");
  assert.deepEqual(calls[0].body, { url: "https://example.com", webhook_url: "https://hook.example/x" });
});

test("Get Deep Audit polls the job once", async () => {
  const { out, calls } = await run({ operation: "getDeepAudit", deepAuditJobId: "abc" }, [{ status: "running", progress: 40 }]);
  assert.equal(out[0].progress, 40);
  assert.equal(calls[0].url, "https://seoscoreapi.com/site-audit/abc");
});

test("Deep Audit Usage uses /deep-audit/usage on the main host", async () => {
  const { calls } = await run({ operation: "deepAuditUsage" }, [{ tier: "pro" }]);
  assert.equal(calls[0].url, "https://seoscoreapi.com/deep-audit/usage");
});

test("base URL override from the credential (legacy engine host uses /usage)", async () => {
  const creds = { apiKey: "k", deepAuditBaseUrl: "https://engine.seoscoreapi.com/" };
  const { calls } = await run({ operation: "deepAuditUsage" }, [{}], creds);
  assert.equal(calls[0].url, "https://engine.seoscoreapi.com/usage");
  const r = await run({ operation: "getDeepAudit", deepAuditJobId: "abc" }, [{}], { apiKey: "k", deepAuditBaseUrl: "http://localhost:9000" });
  assert.equal(r.calls[0].url, "http://localhost:9000/site-audit/abc");
});
