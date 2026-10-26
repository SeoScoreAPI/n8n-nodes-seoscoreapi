"use strict";
// A fake n8n execute context for the built node (dist/). No network.
const { SeoScoreApi } = require("../dist/nodes/SeoScoreApi/SeoScoreApi.node.js");
const { SeoScoreApi: SeoScoreApiCredentials } = require("../dist/credentials/SeoScoreApi.credentials.js");

SeoScoreApi.pollIntervalMs = 1;

function run(params, responses, credentials = { apiKey: "k" }, { continueOnFail = false } = {}) {
  const calls = [];
  const queue = [...responses];
  const ctx = {
    getInputData: () => [{ json: {} }],
    getNodeParameter: (name, _i, fallback) => (name in params ? params[name] : fallback),
    getCredentials: async () => credentials,
    getNode: () => ({ name: "SEO Score API", type: "n8n-nodes-seoscoreapi.seoScoreApi", typeVersion: 2, parameters: {} }),
    continueOnFail: () => continueOnFail,
    helpers: {
      httpRequestWithAuthentication: async (credentialType, opts) => {
        calls.push({ credentialType, ...opts });
        const next = queue.shift();
        if (next instanceof Error) throw next;
        return next;
      },
      prepareBinaryData: async (buffer, fileName, mimeType) => ({ data: buffer.toString("base64"), fileName, mimeType }),
    },
  };
  return new SeoScoreApi().execute
    .call(ctx)
    .then((out) => ({ items: out[0], out: out[0].map((x) => x.json), calls }));
}

/** Every operation value, from the version 1 flat list. */
function legacyOperations() {
  const props = new SeoScoreApi().description.properties;
  const legacy = props.find((p) => p.name === "operation" && p.displayOptions.show["@version"][0] === 1);
  return legacy.options.map((o) => o.value);
}

module.exports = { SeoScoreApi, SeoScoreApiCredentials, run, legacyOperations };
