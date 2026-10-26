# n8n-nodes-seoscoreapi

An [n8n](https://n8n.io) community node for [SEO Score API](https://seoscoreapi.com) — run SEO audits inside any n8n workflow. 80+ checks across SEO, performance, accessibility, and AI readability, returned as scored JSON.

## Install

In n8n: **Settings → Community Nodes → Install**, then enter:

```
n8n-nodes-seoscoreapi
```

Or via npm in a self-hosted instance:

```bash
npm install n8n-nodes-seoscoreapi
```

## Credentials

Create an **SEO Score API** credential with your API key. Get a free key (no credit card) at [seoscoreapi.com](https://seoscoreapi.com); the free plan includes 20 audits a month. Paid plans and what each includes are listed at [seoscoreapi.com/#pricing](https://seoscoreapi.com/#pricing).

The key is sent in the `X-API-Key` header. n8n's **Test** button on the credential calls
`GET https://seoscoreapi.com/usage`, which only reads your usage and does not count as an audit.

The credential also has a **Deep Audit Base URL** (default `https://seoscoreapi.com`). Leave
it alone unless you route through a proxy or staging host; the legacy
`https://engine.seoscoreapi.com` still works there too.

## Operations

New nodes (node version 2) group the operations by **Resource**. Workflows saved with an
earlier release keep node version 1 and its single **Operation** list; both versions run
the same operations with the same parameters.

| Resource | Operation | Description |
|---|---|---|
| **Page** | Audit | Full SEO audit of one URL. Turn on **Include Core Web Vitals** for measured LCP, INP and CLS (about 10 seconds slower) |
| | Batch Audit | Audit up to 10 URLs in one call (paid); **Include Core Web Vitals** optional |
| | Compare | Structured diff across 2–5 URLs (Basic+) |
| | Compare With Competitor | Head-to-head against a competitor's page for a keyword (Pro+) |
| | Audit Accessibility | ADA / WCAG 2.1 AA audit with lawsuit risk and fixes (paid plans; own monthly allowance) |
| | Export Audit Report | Audit as a PDF, Markdown or CSV file in a binary field (counts as one audit; white-label on Pro and Ultra) |
| | Score AI Readability | How well AI/LLM systems can consume a page |
| | List Trackers | Third-party trackers and pixels a page loads |
| | Score Conversion | Headline, CTA, trust, forms and objections, with a fix list |
| **Audit History** | Get | The audit timeseries for a URL (Starter+) |
| | Get Many Domains | Every audited domain with latest score and trend (Starter+) |
| **Deep Audit** | Run and Wait | Thorough AI-assisted audit across 9 dimensions; waits for the result (timeout configurable, default 10 min) (**Pro/Ultra**, or credits) |
| | Start | Queue a Deep Audit and return `job_id` at once; optional webhook on completion |
| | Get | A job's status (`queued`/`running`/`completed`/`failed`) and its `result` once done |
| | Get Usage | Deep Audits used and remaining this month |
| **Site Crawl** | Run and Wait | Multi-page crawl; waits for the result (Pro/Ultra, or a Deep Audit credit) |
| | Start / Get | Start a crawl and poll it yourself |
| **Site** | Get Backlinks | Observed backlinks, an audit-fed sample (Basic+) |
| | Generate llms.txt | llms.txt text for a domain (curated version on Basic+) |
| | Find Page-2 Quick Wins | Queries ranking 11-20 worth working on, from your own Search Console export |
| **GEO** | Audit Page / Probe Brand | Visibility to LLMs / how often LLMs mention your brand (Basic+) |
| | Create / Get Many / Delete Monitor, Get Monitor History | GEO monitoring (Basic+) |
| **AI Citation** | Get Starter Prompts / Suggest Prompts | Prompts to track for AI citations (not metered) |
| | Create / Get / Get Many / Update / Delete Tracker | Track a brand across ChatGPT, Gemini, Perplexity and Claude (Starter+) |
| | Run Tracker / Get Run / Get Tracker History | Run a tracker, read a run, read the trend (metered in checks) |
| | Check Prompt | One-off check for a brand and one prompt (paid plans) |
| **AI Citation Credit** | Get Top-Ups / Create Top-Up Checkout Link | Packs and balance / a Stripe Checkout link for a pack (nothing is charged until it is paid) |
| | Get Auto-Reload Setting | Read the auto-reload setting. It can only be changed from the dashboard; there is no operation that turns it on |
| **Account** | Get Usage | Current usage and plan limits |
| | Set Scoreboard Visibility | Opt in or out of the public scoreboard |

The node can also be used as a tool by n8n's AI Agent.

Not included: account actions (signup, verify, upgrade, rotate key).

## Example workflow

A common pattern: **Schedule Trigger → Page: Audit → IF score < 85 → Slack**. This gives you a no-code SEO regression alarm for any site. See the [n8n SEO automation guide](https://seoscoreapi.com/blog/n8n-seo-automation) for ready-made workflows.

### Deep Audit without blocking the workflow

Deep Audits take about 90 seconds once they start (longer when queued). For long-running
or many-site workflows, split it: **Deep Audit: Start → Wait (2 min) → Deep Audit: Get → IF
status = completed**, looping back to Wait otherwise. Calls go to
`POST /site-audit`, `GET /site-audit/{job_id}` and `GET /deep-audit/usage` on
`https://seoscoreapi.com`. Included on Pro (20/month) and Ultra (100/month); other keys
use purchased Deep Audit credits.

### Email a branded PDF report

**Page: Export Audit Report** writes the file to a binary field (`data` by default), so it plugs
straight into an email or storage node: **Schedule Trigger → Export Audit Report (PDF) →
Send Email (attachment: `data`)**. Set Brand Name / Brand Color / Logo URL for a
white-label report (Pro and Ultra).

### Weekly AI citation report

**Schedule Trigger → AI Citation: Run Tracker → IF mention rate dropped → Slack.** A run needs
all of its checks up front (the month's allowance plus any top-up balance); when that is
short the API answers 429 and nothing is spent. **AI Citation Credit: Create Top-Up Checkout Link** returns a
payment link you can send yourself.

### Site crawl without blocking

**Site Crawl: Start → Wait → Site Crawl: Get → IF status = completed**, looping back to Wait
otherwise. **Site Crawl: Run and Wait** does the same in one node with a timeout.

## Compatibility

Built with the `@n8n/node-cli` toolchain, with no runtime dependencies
(`n8nNodesApiVersion` 1).

## Development

```bash
npm ci
npm run lint
npm run build
npm test      # builds, then runs the node:test suite against dist/ with mocked HTTP
```

Releases are published to npm with provenance by `.github/workflows/publish.yml` when a
version tag (for example `1.8.0`) is pushed.

## Documentation

- API docs: [seoscoreapi.com/docs](https://seoscoreapi.com/docs)
- SEO Monitor API: [seoscoreapi.com/seo-monitor-api](https://seoscoreapi.com/seo-monitor-api)

Part of [SEO Score API](https://seoscoreapi.com) — instant SEO audits via API.

## License

[MIT](LICENSE.md)
