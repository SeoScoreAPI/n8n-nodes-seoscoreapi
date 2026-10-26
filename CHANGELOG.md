# Changelog

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
