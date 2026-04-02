"use strict";

class SeoScoreApi {
  constructor() {
    this.description = {
      displayName: "SEO Score API",
      name: "seoScoreApi",
      icon: "file:seoscoreapi.svg",
      group: ["transform"],
      version: 1,
      subtitle: '={{$parameter["operation"]}}',
      description: "Audit any URL for SEO issues — 28 checks, scored JSON response",
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
      ],
    };
  }

  async execute() {
    const items = this.getInputData();
    const operation = this.getNodeParameter("operation", 0);
    const credentials = await this.getCredentials("seoScoreApi");
    const returnData = [];
    const ua = "seoscoreapi-n8n/1.1.0";

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
      }

      returnData.push({ json: response });
    }

    return [returnData];
  }
}

module.exports = { nodeClass: SeoScoreApi };
