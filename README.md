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

Create an **SEO Score API** credential with your API key. Get a free key (no credit card) at [seoscoreapi.com](https://seoscoreapi.com).

The credential also has a **Deep Audit Base URL** (default `https://seoscoreapi.com`). Leave
it alone unless you route through a proxy or staging host; the legacy
`https://engine.seoscoreapi.com` still works there too.

## Operations

| Operation | Description |
|---|---|
| **Audit URL** | Run a full SEO audit on a single URL. Turn on **Include Core Web Vitals** for measured LCP, INP and CLS (about 10 seconds slower) |
| **Batch Audit** | Audit up to 10 URLs in one call (paid); **Include Core Web Vitals** optional |
| **Check Usage** | Return current usage and plan limits |
| **Get History** | Pull the audit timeseries for a URL (Starter+) |
| **List Tracked Domains** | Every audited domain with latest score and trend (Starter+) |
| **Compare URLs** | Structured diff across 2–5 URLs (Basic+) |
| **Deep Audit** | Thorough AI-assisted audit across 9 dimensions; waits for the result (timeout configurable, default 10 min) (**Pro/Ultra**, or credits) |
| **Start Deep Audit** | Queue a Deep Audit and return `job_id` at once; optional webhook on completion |
| **Get Deep Audit** | A job's status (`queued`/`running`/`completed`/`failed`) and its `result` once done |
| **Deep Audit Usage** | Deep Audits used and remaining this month |
| **Scoreboard Opt-Out** | Opt in or out of the public scoreboard |
| **Competitive Audit** | Head-to-head against a competitor's page for a keyword (Pro+) |
| **Accessibility Audit** | ADA / WCAG 2.1 AA audit with lawsuit risk and fixes (paid plans; own monthly allowance) |
| **Export Audit Report** | Audit as a PDF, Markdown or CSV file in a binary field (counts as one audit; white-label on Pro and Ultra) |
| **AI Readability** | How well AI/LLM systems can consume a page |
| **Tracker Inventory** | Third-party trackers and pixels a page loads |
| **Conversion Score** | Headline, CTA, trust, forms and objections, with a fix list |
| **Page-2 Quick Wins** | Queries ranking 11-20 worth working on, from your own Search Console export |
| **Get Backlinks** | Observed backlinks, an audit-fed sample (Basic+) |
| **Generate llms.txt** | llms.txt text for a domain (curated version on Basic+) |
| **GEO Audit** / **GEO Brand Probe** | Visibility to LLMs / how often LLMs mention your brand (Basic+) |
| **Add / List / Remove GEO Monitor**, **GEO Monitor History** | GEO monitoring (Basic+) |
| **Crawl Site** | Multi-page crawl; waits for the result (Pro/Ultra, or a Deep Audit credit) |
| **Start Site Crawl** / **Get Site Crawl** | Start a crawl and poll it yourself |
| **Citation Starter Prompts** / **Citation Suggest Prompts** | Prompts to track for AI citations (not metered) |
| **Create / List / Get / Update / Delete Citation Tracker** | Track a brand across ChatGPT, Gemini, Perplexity and Claude (Starter+) |
| **Run Citation Tracker** / **Get Citation Run** / **Citation Tracker History** | Run a tracker, read a run, read the trend (metered in checks) |
| **Citation Check** | One-off check for a brand and one prompt (paid plans) |
| **Citation Top-Ups** / **Citation Top-Up Checkout** | Packs and balance / a Stripe Checkout link for a pack (nothing is charged until it is paid) |
| **Citation Auto-Reload (Read)** | Read the auto-reload setting. It can only be changed from the dashboard; there is no operation that turns it on |

Not included: account actions (signup, verify, upgrade, rotate key).

## Example workflow

A common pattern: **Schedule Trigger → Audit URL → IF score < 85 → Slack**. This gives you a no-code SEO regression alarm for any site. See the [n8n SEO automation guide](https://seoscoreapi.com/blog/n8n-seo-automation) for ready-made workflows.

### Deep Audit without blocking the workflow

Deep Audits take about 90 seconds once they start (longer when queued). For long-running
or many-site workflows, split it: **Start Deep Audit → Wait (2 min) → Get Deep Audit → IF
status = completed**, looping back to Wait otherwise. Calls go to
`POST /site-audit`, `GET /site-audit/{job_id}` and `GET /deep-audit/usage` on
`https://seoscoreapi.com`. Included on Pro (20/month) and Ultra (100/month); other keys
use purchased Deep Audit credits.

### Email a branded PDF report

**Export Audit Report** writes the file to a binary field (`data` by default), so it plugs
straight into an email or storage node: **Schedule Trigger → Export Audit Report (PDF) →
Send Email (attachment: `data`)**. Set Brand Name / Brand Color / Logo URL for a
white-label report (Pro and Ultra).

### Weekly AI citation report

**Schedule Trigger → Run Citation Tracker → IF mention rate dropped → Slack.** A run needs
all of its checks up front (the month's allowance plus any top-up balance); when that is
short the API answers 429 and nothing is spent. **Citation Top-Up Checkout** returns a
payment link you can send yourself.

### Site crawl without blocking

**Start Site Crawl → Wait → Get Site Crawl → IF status = completed**, looping back to Wait
otherwise. **Crawl Site** does the same in one node with a timeout.

## Documentation

- API docs: [seoscoreapi.com/docs](https://seoscoreapi.com/docs)
- SEO Monitor API: [seoscoreapi.com/seo-monitor-api](https://seoscoreapi.com/seo-monitor-api)

Part of [SEO Score API](https://seoscoreapi.com) — instant SEO audits via API.

## License

MIT
