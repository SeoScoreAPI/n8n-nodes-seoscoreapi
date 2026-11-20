# Changelog

## 1.7.6 (2026-11-20)

For n8n's Creator Portal, which rejected 1.7.5 with "Can't find credential file in repo": the
portal maps each `dist/<dir>/X.js` in `package.json` to the TypeScript source `<dir>/X.ts` in
the linked repository, and 1.7.5 had plain `.js` sources.

- **Source is TypeScript in n8n's starter layout:** `credentials/SeoScoreApi.credentials.ts`,
  `nodes/SeoScoreApi/SeoScoreApi.node.ts` and `icons/seoscoreapi.svg`, compiled by `tsc` to the
  same `dist/` paths as before. Same API calls, `User-Agent: seoscoreapi-n8n/<version>`
  header and `<status> - <body>` API errors. Still no runtime dependencies (`typescript`,
  `n8n-workflow` and `@types/node` are dev dependencies; `n8n-workflow` stays a peer).
- **Resources (node version 2).** New nodes pick a Resource (Account, Audit, Citation, Deep
  Audit, GEO, History, Site), then an operation. Nodes saved before 1.7.6 stay on version 1
  with the flat operation list and run unchanged. Operation values and parameter names did not
  change.
- The credential has a **Test** button (checks the key against `/usage`, no audits spent) and
  an icon.
- The node can be used as an AI Agent tool (`usableAsTool`).
- Output items link back to their input item (`pairedItem`).
- Errors raised by the node itself (invalid JSON in a field, a failed or timed-out deep audit
  or crawl) are n8n `NodeOperationError`s with the same messages.
- Option lists are in alphabetical order and option labels use n8n's casing (for example
  "Auto-Detect", "E-Commerce"); Brand Color uses n8n's color picker. Stored values are unchanged.

## 1.7.5 (2026-11-20)

- Waiting between deep-audit polls uses n8n's own `sleep` helper (from `n8n-workflow`, which n8n
  provides) instead of a timer global, which n8n's verification check does not allow. No change in
  behaviour.

## 1.7.4 (2026-11-20)

Fixes for n8n's verification checks, plus the operations below.

- **The node loads in n8n again.** n8n loads the class named after each file
  (`SeoScoreApi` from `SeoScoreApi.node.js` and `SeoScoreApi.credentials.js`); 1.7.3 and earlier
  exported `nodeClass` and `SeoScoreApiCredentials`, so n8n reported "Class could not be found".
  Both files now export `SeoScoreApi` (the old names are still exported).
- API calls use n8n's `this.helpers.httpRequest` instead of the deprecated
  `this.helpers.request`. Same URLs, headers (`X-API-Key`, `User-Agent: seoscoreapi-n8n/<version>`),
  query parameters and JSON handling; an API error still reads `<status> - <body>` with
  `statusCode` and `error`.
- The package ships compiled output under `dist/` (`dist/nodes/SeoScoreApi/`,
  `dist/credentials/`), which `n8n.nodes` / `n8n.credentials` point at. `npm run build` makes it;
  `npm pack` / `npm publish` and `npm test` build first.
- `n8n-workflow` is a peer dependency.
- **Agent View** operation: `GET /agent-view`, what ChatGPT-User, GPTBot, PerplexityBot and ClaudeBot
  receive compared with a browser (blocks, challenge pages, text parity, content that needs
  JavaScript). Paid plans; counts as one audit.
- **Citation Tracker History**: optional Change Date and Runs Each Side add `before_after`, the
  runs before that date compared with the runs on or after it, per engine, with counts.

## 1.7.3 (2026-10-26)

Published from the public `SeoScoreAPI/n8n-nodes-seoscoreapi` repository with an npm
provenance statement, which n8n requires for verified community nodes. No code changes.

## 1.7.2 (2026-10-20)

- The Engines option on Create Citation Tracker and Citation Check now lists every engine
  the API accepts. Added GPT (one of the API's defaults) and Amazon Nova; ChatGPT is now
  labelled as the web-search product.
- Run Citation Tracker: a run over 45 seconds now returns `{run_id, status: "running", poll}`
  (the API answers 202 instead of timing out); use Get Citation Run with that id until it is
  `completed`.

## 1.7.1 (2026-10-09)

Package metadata only: the repository and issue links point at the public
`SeoScoreAPI` repositories. No code changes.

## 1.7.0 (2026-10-07)

Core Web Vitals are now opt-in on the API, so audits no longer wait on Google
PageSpeed Insights unless asked:

- **Audit URL** and **Batch Audit** have an **Include Core Web Vitals** switch (off by
  default). When on, the output carries measured LCP, INP, CLS, FCP and TTFB under
  `core_web_vitals`; the first measurement of a URL adds about 10 seconds and is cached
  for 24 hours.
- With it off, `core_web_vitals.status` is `not_requested`.

## 1.6.0 (2026-10-06)

Catches the node up with the API. New operations:

- **Accessibility Audit**, **Export Audit Report** (PDF / Markdown / CSV as binary data,
  white-label fields), **AI Readability**, **Tracker Inventory**, **Conversion Score**,
  **Page-2 Quick Wins**, **Get Backlinks**, **Generate llms.txt**, **Competitive Audit**.
- GEO: **GEO Audit**, **GEO Brand Probe**, **Add / List / Remove GEO Monitor**,
  **GEO Monitor History**.
- Site crawl: **Crawl Site** (waits, configurable timeout), **Start Site Crawl**,
  **Get Site Crawl**.
- AI citations: **Citation Starter Prompts**, **Citation Suggest Prompts**, **Create /
  List / Get / Update / Delete Citation Tracker**, **Run Citation Tracker**, **Get
  Citation Run**, **Citation Tracker History**, **Citation Check**, **Citation Top-Ups**,
  **Citation Top-Up Checkout**, **Citation Auto-Reload (Read)**. There is no operation
  that turns auto-reload on: the API does not allow it with an API key.
- Tests for the new operations (`test/endpoints.test.js`).

## 1.5.0 (2026-10-02)

- Deep Audit calls go to the main host, `https://seoscoreapi.com`
  (`POST /site-audit`, `GET /site-audit/{job_id}`, `GET /deep-audit/usage`), instead of
  `engine.seoscoreapi.com`. The old host still works.
- New credential field **Deep Audit Base URL** (default `https://seoscoreapi.com`) to
  override the Deep Audit host.
- New operations: **Start Deep Audit** (returns the job, optional webhook), **Get Deep
  Audit** (poll a job), **Deep Audit Usage**.
- **Deep Audit** (wait for result) gets a configurable timeout (default 600 s, was a fixed
  5 minutes).
- Tests (`npm test`, Node's built-in runner, no n8n install needed).

## 1.4.0

- Deep Audit operation (engine host, waits for the result).

Earlier releases: see the git history of `sdks/n8n`.
