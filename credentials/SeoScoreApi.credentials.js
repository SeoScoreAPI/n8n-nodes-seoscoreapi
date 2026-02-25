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
    ];
  }
}

module.exports = { SeoScoreApiCredentials };
