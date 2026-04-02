# n8n-nodes-seoscoreapi

[n8n](https://n8n.io/) community node for [SEO Score API](https://seoscoreapi.com) — audit any URL for SEO issues in your automation workflows.

## Operations

| Operation | Description |
|-----------|-------------|
| **Audit URL** | Run a full 28-check SEO audit on any URL |
| **Batch Audit** | Audit up to 10 URLs in one call (paid plans) |
| **Check Usage** | View your API usage and limits |
| **Scoreboard Opt-Out** | Opt in or out of the public SEO scoreboard |

## Setup

1. Get a free API key at [seoscoreapi.com](https://seoscoreapi.com) (no credit card needed)
2. Install this node: **Settings → Community Nodes → Install → `n8n-nodes-seoscoreapi`**
3. Add your API key in the credentials

## Example Workflows

### Scheduled SEO Monitoring
**Cron (weekly)** → **SEO Score API (Audit)** → **IF (score < 80)** → **Slack/Email alert**

### Bulk Client Audits
**Spreadsheet (client URLs)** → **SEO Score API (Audit)** → **Google Sheets (write results)**

### CI/CD Quality Gate
**Webhook (deploy event)** → **SEO Score API (Audit)** → **IF (score < 70)** → **Slack alert**

## Output

The Audit operation returns:
- `score` (0-100)
- `grade` (A+ to F)
- `checks` (28 individual check results)
- `priorities` (top issues to fix, with severity)

## Links

- [SEO Score API](https://seoscoreapi.com)
- [API Docs](https://seoscoreapi.com/docs)
- [GitHub](https://github.com/SeoScoreAPI/n8n-nodes-seoscoreapi)

## License

MIT
