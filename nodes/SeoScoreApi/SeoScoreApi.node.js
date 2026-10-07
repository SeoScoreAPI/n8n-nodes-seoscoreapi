"use strict";

const VERSION = "1.5.0";
const DEFAULT_DEEP_AUDIT_URL = "https://seoscoreapi.com";

// Main host: /deep-audit/usage (its /usage is the per-URL allowance).
// Legacy engine.seoscoreapi.com: /usage.
function deepAuditUsagePath(base) {
  return base.replace(/^[a-z]+:\/\//i, "").startsWith("engine.") ? "/usage" : "/deep-audit/usage";
}

class SeoScoreApi {
  constructor() {
    this.description = {
      displayName: "SEO Score API",
      name: "seoScoreApi",
      icon: "file:seoscoreapi.svg",
      group: ["transform"],
      version: 1,
      subtitle: '={{$parameter["operation"]}}',
      description: "Audit any URL for SEO issues — 80+ checks, scored JSON response",
      defaults: { name: "SEO Score API" },
      inputs: ["main"],
      outputs: ["main"],
      credentials: [
        {
          name: "seoScoreApi",
          required: true,
        },
      ],
      properties: [
        {
          displayName: "Operation",
          name: "operation",
          type: "options",
          noDataExpression: true,
          options: [
            {
              name: "Audit URL",
              value: "audit",
              description: "Run a full SEO audit on a URL",
              action: "Audit a URL",
            },
            {
              name: "Batch Audit",
              value: "batchAudit",
              description: "Audit multiple URLs at once (paid plans only)",
              action: "Batch audit URLs",
            },
            {
              name: "Check Usage",
              value: "usage",
              description: "Check your API usage and limits",
              action: "Check usage",
            },
            {
              name: "Scoreboard Opt-Out",
              value: "scoreboardOptOut",
              description: "Opt in or out of the public SEO scoreboard",
              action: "Scoreboard opt-out",
            },
            {
              name: "Get History",
              value: "history",
              description: "Get historical audit scores and trend summary for a URL (Starter plan or higher)",
              action: "Get URL audit history",
            },
            {
              name: "List Tracked Domains",
              value: "historyDomains",
              description: "List every domain you have audited with latest score and 30-day trend (Starter plan or higher)",
              action: "List tracked domains",
            },
            {
              name: "Compare URLs",
              value: "compare",
              description: "Compare 2–5 URLs side by side with a structured diff (Basic plan or higher)",
              action: "Compare URLs",
            },
            {
              name: "Deep Audit",
              value: "deepAudit",
              description: "Run a thorough AI-assisted audit across 9 dimensions; waits for the result (Pro/Ultra, or credits)",
              action: "Run a deep audit",
            },
            {
              name: "Start Deep Audit",
              value: "startDeepAudit",
              description: "Queue a Deep Audit and return the job ID right away (Pro/Ultra, or credits)",
              action: "Start a deep audit",
            },
            {
              name: "Get Deep Audit",
              value: "getDeepAudit",
              description: "Get a Deep Audit job's status, and its result once completed",
              action: "Get a deep audit",
            },
            {
              name: "Deep Audit Usage",
              value: "deepAuditUsage",
              description: "Deep Audits used and remaining this month",
              action: "Get deep audit usage",
            },
          ],
          default: "audit",
        },
        {
          displayName: "URL",
          name: "url",
          type: "string",
          default: "",
          required: true,
          displayOptions: { show: { operation: ["audit"] } },
          placeholder: "https://example.com",
          description: "The URL to audit for SEO issues",
        },
        {
          displayName: "URLs",
          name: "urls",
          type: "string",
          default: "",
          required: true,
          displayOptions: { show: { operation: ["batchAudit"] } },
          placeholder: "https://example.com, https://example.org",
          description: "Comma-separated list of URLs to audit (max 10)",
        },
        {
          displayName: "Opt Out",
          name: "optOut",
          type: "boolean",
          default: true,
          displayOptions: { show: { operation: ["scoreboardOptOut"] } },
          description: "True to hide from scoreboard, false to show",
        },
        {
          displayName: "URL",
          name: "historyUrl",
          type: "string",
          default: "",
          required: true,
          displayOptions: { show: { operation: ["history"] } },
          placeholder: "https://example.com",
          description: "URL whose audit history to fetch",
        },
        {
          displayName: "Limit",
          name: "historyLimit",
          type: "number",
          default: 100,
          typeOptions: { minValue: 1, maxValue: 1000 },
          displayOptions: { show: { operation: ["history"] } },
          description: "Maximum number of points to return (1–1000)",
        },
        {
          displayName: "URLs",
          name: "compareUrls",
          type: "string",
          default: "",
          required: true,
          displayOptions: { show: { operation: ["compare"] } },
          placeholder: "https://a.com, https://b.com",
          description: "Comma-separated list of 2–5 URLs to compare",
        },
        {
          displayName: "URL",
          name: "deepAuditUrl",
          type: "string",
          default: "",
          required: true,
          displayOptions: { show: { operation: ["deepAudit", "startDeepAudit"] } },
          placeholder: "https://example.com",
          description: "URL to run a deep AI audit on",
        },
        {
          displayName: "Business Type",
          name: "businessType",
          type: "options",
          default: "",
          displayOptions: { show: { operation: ["deepAudit", "startDeepAudit"] } },
          description: "Optional — tunes which checks apply to the site",
          options: [
            { name: "Auto-detect", value: "" },
            { name: "SaaS", value: "saas" },
            { name: "Local Service", value: "local_service" },
            { name: "E-commerce", value: "ecommerce" },
            { name: "Storefront", value: "storefront" },
            { name: "Blog", value: "blog" },
            { name: "Publisher", value: "publisher" },
          ],
        },
        {
          displayName: "Webhook URL",
          name: "deepAuditWebhookUrl",
          type: "string",
          default: "",
          displayOptions: { show: { operation: ["startDeepAudit"] } },
          placeholder: "https://your-n8n.example/webhook/deep-audit",
          description: "Optional — public URL POSTed once when the job completes (no retries; poll with Get Deep Audit as the source of truth)",
        },
        {
          displayName: "Timeout (Seconds)",
          name: "deepAuditTimeout",
          type: "number",
          default: 600,
          typeOptions: { minValue: 30, maxValue: 3600 },
          displayOptions: { show: { operation: ["deepAudit"] } },
          description: "How long to wait for the audit before failing (queued jobs can take a few minutes)",
        },
        {
          displayName: "Job ID",
          name: "deepAuditJobId",
          type: "string",
          default: "",
          required: true,
          displayOptions: { show: { operation: ["getDeepAudit"] } },
          description: "The job_id returned by Start Deep Audit",
        },
      ],
    };
  }

  async execute() {
    const items = this.getInputData();
    const operation = this.getNodeParameter("operation", 0);
    const credentials = await this.getCredentials("seoScoreApi");
    const returnData = [];
    const ua = `seoscoreapi-n8n/${VERSION}`;
    const deepBase = String(credentials.deepAuditBaseUrl || DEFAULT_DEEP_AUDIT_URL).replace(/\/+$/, "");
    const pollMs = SeoScoreApi.pollIntervalMs;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const getJob = (jobId) => this.helpers.request({
      method: "GET",
      url: `${deepBase}/site-audit/${encodeURIComponent(jobId)}`,
      headers: { "X-API-Key": credentials.apiKey, "User-Agent": ua },
      json: true,
    });
    const startJob = (body) => this.helpers.request({
      method: "POST",
      url: `${deepBase}/site-audit`,
      headers: { "X-API-Key": credentials.apiKey, "Content-Type": "application/json", "User-Agent": ua },
      body,
      json: true,
    });

    for (let i = 0; i < items.length; i++) {
      let response;

      if (operation === "audit") {
        const url = this.getNodeParameter("url", i);
        response = await this.helpers.request({
          method: "GET",
          url: `https://seoscoreapi.com/audit`,
          qs: { url },
          headers: { "X-API-Key": credentials.apiKey, "User-Agent": ua },
          json: true,
        });
      } else if (operation === "batchAudit") {
        const urlsStr = this.getNodeParameter("urls", i);
        const urls = urlsStr.split(",").map((u) => u.trim()).filter(Boolean);
        response = await this.helpers.request({
          method: "POST",
          url: "https://seoscoreapi.com/audit/batch",
          headers: {
            "X-API-Key": credentials.apiKey,
            "Content-Type": "application/json",
            "User-Agent": ua,
          },
          body: { urls },
          json: true,
        });
      } else if (operation === "usage") {
        response = await this.helpers.request({
          method: "GET",
          url: "https://seoscoreapi.com/usage",
          headers: { "X-API-Key": credentials.apiKey, "User-Agent": ua },
          json: true,
        });
      } else if (operation === "scoreboardOptOut") {
        const optOut = this.getNodeParameter("optOut", i);
        response = await this.helpers.request({
          method: "PUT",
          url: `https://seoscoreapi.com/scoreboard/opt-out?opt_out=${optOut}`,
          headers: { "X-API-Key": credentials.apiKey, "User-Agent": ua },
          json: true,
        });
      } else if (operation === "history") {
        const url = this.getNodeParameter("historyUrl", i);
        const limit = this.getNodeParameter("historyLimit", i);
        response = await this.helpers.request({
          method: "GET",
          url: "https://seoscoreapi.com/history",
          qs: { url, limit },
          headers: { "X-API-Key": credentials.apiKey, "User-Agent": ua },
          json: true,
        });
      } else if (operation === "historyDomains") {
        response = await this.helpers.request({
          method: "GET",
          url: "https://seoscoreapi.com/history/domains",
          headers: { "X-API-Key": credentials.apiKey, "User-Agent": ua },
          json: true,
        });
      } else if (operation === "compare") {
        const urlsStr = this.getNodeParameter("compareUrls", i);
        const urls = urlsStr.split(",").map((u) => u.trim()).filter(Boolean);
        response = await this.helpers.request({
          method: "POST",
          url: "https://seoscoreapi.com/compare",
          headers: {
            "X-API-Key": credentials.apiKey,
            "Content-Type": "application/json",
            "User-Agent": ua,
          },
          body: { urls },
          json: true,
        });
      } else if (operation === "deepAudit") {
        const url = this.getNodeParameter("deepAuditUrl", i);
        const businessType = this.getNodeParameter("businessType", i);
        const timeoutS = this.getNodeParameter("deepAuditTimeout", i, 600);
        const body = { url };
        if (businessType) body.business_type = businessType;
        const job = await startJob(body);
        const deadline = Date.now() + timeoutS * 1000;
        for (;;) {
          if (Date.now() > deadline) throw new Error(`Deep audit timed out after ${timeoutS} seconds (job ${job.job_id})`);
          await sleep(pollMs);
          const s = await getJob(job.job_id);
          if (s.status === "completed") { response = s.result; break; }
          if (s.status === "failed") throw new Error(s.error || "Deep audit failed");
        }
      } else if (operation === "startDeepAudit") {
        const url = this.getNodeParameter("deepAuditUrl", i);
        const businessType = this.getNodeParameter("businessType", i);
        const webhookUrl = this.getNodeParameter("deepAuditWebhookUrl", i, "");
        const body = { url };
        if (businessType) body.business_type = businessType;
        if (webhookUrl) body.webhook_url = webhookUrl;
        response = await startJob(body);
      } else if (operation === "getDeepAudit") {
        response = await getJob(this.getNodeParameter("deepAuditJobId", i));
      } else if (operation === "deepAuditUsage") {
        response = await this.helpers.request({
          method: "GET",
          url: `${deepBase}${deepAuditUsagePath(deepBase)}`,
          headers: { "X-API-Key": credentials.apiKey, "User-Agent": ua },
          json: true,
        });
      }

      returnData.push({ json: response });
    }

    return [returnData];
  }
}

SeoScoreApi.pollIntervalMs = 5000;

module.exports = { nodeClass: SeoScoreApi };
