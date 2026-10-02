# n8n-nodes-seoscoreapi

An [n8n](https://n8n.io) community node for [SEO Score API](https://seoscoreapi.com) — run SEO audits inside any n8n workflow. 83 checks across SEO, performance, accessibility, and AI readability, returned as scored JSON.

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
| **Audit URL** | Run a full SEO audit on a single URL |
| **Batch Audit** | Audit up to 10 URLs in one call (paid) |
| **Check Usage** | Return current usage and plan limits |
| **Get History** | Pull the audit timeseries for a URL (Starter+) |
| **List Tracked Domains** | Every audited domain with latest score and trend (Starter+) |
| **Compare URLs** | Structured diff across 2–5 URLs (Basic+) |
| **Deep Audit** | Thorough AI-assisted audit across 9 dimensions; waits for the result (timeout configurable, default 10 min) (**Pro/Ultra**, or credits) |
| **Start Deep Audit** | Queue a Deep Audit and return `job_id` at once; optional webhook on completion |
| **Get Deep Audit** | A job's status (`queued`/`running`/`completed`/`failed`) and its `result` once done |
| **Deep Audit Usage** | Deep Audits used and remaining this month |
| **Scoreboard Opt-Out** | Opt in or out of the public scoreboard |

## Example workflow

A common pattern: **Schedule Trigger → Audit URL → IF score < 85 → Slack**. This gives you a no-code SEO regression alarm for any site. See the [n8n SEO automation guide](https://seoscoreapi.com/blog/n8n-seo-automation) for ready-made workflows.

### Deep Audit without blocking the workflow

Deep Audits take about 90 seconds once they start (longer when queued). For long-running
or many-site workflows, split it: **Start Deep Audit → Wait (2 min) → Get Deep Audit → IF
status = completed**, looping back to Wait otherwise. Calls go to
`POST /site-audit`, `GET /site-audit/{job_id}` and `GET /deep-audit/usage` on
`https://seoscoreapi.com`. Included on Pro (20/month) and Ultra (100/month); other keys
use purchased Deep Audit credits.

## Documentation

- API docs: [seoscoreapi.com/docs](https://seoscoreapi.com/docs)
- SEO Audit API: [seoscoreapi.com/seo-audit-api](https://seoscoreapi.com/seo-audit-api)
- SEO Monitor API: [seoscoreapi.com/seo-monitor-api](https://seoscoreapi.com/seo-monitor-api)

Part of [SEO Score API](https://seoscoreapi.com) — instant SEO audits via API.

## License

MIT
