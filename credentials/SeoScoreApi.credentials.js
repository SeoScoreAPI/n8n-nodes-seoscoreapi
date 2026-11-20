"use strict";

class SeoScoreApiCredentials {
  constructor() {
    this.name = "seoScoreApi";
    this.displayName = "SEO Score API";
    this.documentationUrl = "https://seoscoreapi.com/docs";
    this.properties = [
      {
        displayName: "API Key",
        name: "apiKey",
        type: "string",
        typeOptions: { password: true },
        default: "",
        required: true,
        description: "Your SEO Score API key. Get one free at https://seoscoreapi.com",
      },
      {
        displayName: "Deep Audit Base URL",
        name: "deepAuditBaseUrl",
        type: "string",
        default: "https://seoscoreapi.com",
        description: "Host for the Deep Audit operations. Leave as is unless you use a proxy or staging host (the legacy https://engine.seoscoreapi.com also works).",
      },
    ];
  }
}

// n8n loads the class named after the file (SeoScoreApi.credentials.js -> SeoScoreApi).
// SeoScoreApiCredentials is the name 1.7.3 and earlier exported; kept for index.js and tests.
module.exports = { SeoScoreApi: SeoScoreApiCredentials, SeoScoreApiCredentials };
