"use strict";

const VERSION = "1.7.1";
const API_URL = "https://seoscoreapi.com";
const DEFAULT_DEEP_AUDIT_URL = "https://seoscoreapi.com";

// Main host: /deep-audit/usage (its /usage is the per-URL allowance).
// Legacy engine.seoscoreapi.com: /usage.
function deepAuditUsagePath(base) {
  return base.replace(/^[a-z]+:\/\//i, "").startsWith("engine.") ? "/usage" : "/deep-audit/usage";
}

class SeoScoreApi {
  constructor() {
    this.description = {
      displayName: "SEO Score API",
      name: "seoScoreApi",
      icon: "file:seoscoreapi.svg",
      group: ["transform"],
      version: 1,
      subtitle: '={{$parameter["operation"]}}',
      description: "Audit any URL for SEO issues — 80+ checks, scored JSON response",
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
            {
              name: "Get History",
              value: "history",
              description: "Get historical audit scores and trend summary for a URL (Starter plan or higher)",
              action: "Get URL audit history",
            },
            {
              name: "List Tracked Domains",
              value: "historyDomains",
              description: "List every domain you have audited with latest score and 30-day trend (Starter plan or higher)",
              action: "List tracked domains",
            },
            {
              name: "Compare URLs",
              value: "compare",
              description: "Compare 2–5 URLs side by side with a structured diff (Basic plan or higher)",
              action: "Compare URLs",
            },
            {
              name: "Deep Audit",
              value: "deepAudit",
              description: "Run a thorough AI-assisted audit across 9 dimensions; waits for the result (Pro/Ultra, or credits)",
              action: "Run a deep audit",
            },
            {
              name: "Start Deep Audit",
              value: "startDeepAudit",
              description: "Queue a Deep Audit and return the job ID right away (Pro/Ultra, or credits)",
              action: "Start a deep audit",
            },
            {
              name: "Get Deep Audit",
              value: "getDeepAudit",
              description: "Get a Deep Audit job's status, and its result once completed",
              action: "Get a deep audit",
            },
            {
              name: "Deep Audit Usage",
              value: "deepAuditUsage",
              description: "Deep Audits used and remaining this month",
              action: "Get deep audit usage",
            },
            {
              name: "Competitive Audit",
              value: "competitiveAudit",
              description: "Head-to-head comparison against a competitor's page with keyword-relevance scoring (Pro plan or higher)",
              action: "Run a competitive audit",
            },
            {
              name: "Accessibility Audit",
              value: "accessibilityAudit",
              description: "ADA / WCAG 2.1 AA accessibility audit with lawsuit risk and fixes (paid plans; own monthly allowance)",
              action: "Run an accessibility audit",
            },
            {
              name: "Export Audit Report",
              value: "exportAudit",
              description: "Run an audit and download it as a PDF, Markdown or CSV file (counts as one audit; white-label on Pro and Ultra)",
              action: "Export an audit report",
            },
            {
              name: "AI Readability",
              value: "aiReadability",
              description: "Score how well a page can be consumed by AI/LLM systems",
              action: "Score AI readability",
            },
            {
              name: "Tracker Inventory",
              value: "trackers",
              description: "List the third-party trackers and pixels a page loads (counts as one audit)",
              action: "List trackers on a page",
            },
            {
              name: "Conversion Score",
              value: "conversion",
              description: "Score how well a page turns a visitor into a lead or a sale (counts as one audit)",
              action: "Score a page for conversion",
            },
            {
              name: "Page-2 Quick Wins",
              value: "quickWins",
              description: "Find queries ranking 11-20 worth working on first, from your own Search Console export (every plan; counts as one audit)",
              action: "Find page-2 quick wins",
            },
            {
              name: "Get Backlinks",
              value: "backlinks",
              description: "Observed backlinks for a domain: an audit-fed sample, not a full index (Basic plan or higher)",
              action: "Get backlinks",
            },
            {
              name: "Generate llms.txt",
              value: "llmsTxt",
              description: "Generate an llms.txt file for a domain (curated version on Basic plan or higher)",
              action: "Generate llms.txt",
            },
            {
              name: "GEO Audit",
              value: "geoAudit",
              description: "Generative Engine Optimization audit: how visible a page is to LLMs (Basic plan or higher)",
              action: "Run a GEO audit",
            },
            {
              name: "GEO Brand Probe",
              value: "geoBrandProbe",
              description: "Probe LLMs to measure how often your brand is mentioned in AI responses (Basic plan or higher)",
              action: "Run a GEO brand probe",
            },
            {
              name: "Add GEO Monitor",
              value: "addGeoMonitor",
              description: "Create a GEO monitor for a URL (Basic plan or higher)",
              action: "Add a GEO monitor",
            },
            {
              name: "List GEO Monitors",
              value: "listGeoMonitors",
              description: "List your active GEO monitors",
              action: "List GEO monitors",
            },
            {
              name: "GEO Monitor History",
              value: "geoMonitorHistory",
              description: "Score history for a GEO monitor",
              action: "Get GEO monitor history",
            },
            {
              name: "Remove GEO Monitor",
              value: "removeGeoMonitor",
              description: "Remove a GEO monitor by URL",
              action: "Remove a GEO monitor",
            },
            {
              name: "Crawl Site",
              value: "crawl",
              description: "Crawl a site for broken pages, redirects, duplicate titles and orphan pages; waits for the result (Pro/Ultra, or a Deep Audit credit)",
              action: "Crawl a site",
            },
            {
              name: "Start Site Crawl",
              value: "startCrawl",
              description: "Start a site crawl and return the job ID right away (Pro/Ultra, or a Deep Audit credit)",
              action: "Start a site crawl",
            },
            {
              name: "Get Site Crawl",
              value: "getCrawl",
              description: "Get a site crawl's status, and its result once completed",
              action: "Get a site crawl",
            },
            {
              name: "Citation Starter Prompts",
              value: "citationStarterPrompts",
              description: "Build a starter set of prompts to track from your topic, brand and competitors (every plan; not metered)",
              action: "Get citation starter prompts",
            },
            {
              name: "Citation Suggest Prompts",
              value: "citationSuggestPrompts",
              description: "Suggest prompts to track, read off what a site says it does",
              action: "Suggest citation prompts",
            },
            {
              name: "Create Citation Tracker",
              value: "createCitationTracker",
              description: "Track a brand's visibility in AI answers (Starter plan or higher)",
              action: "Create a citation tracker",
            },
            {
              name: "List Citation Trackers",
              value: "listCitationTrackers",
              description: "List your citation trackers with the month's check usage",
              action: "List citation trackers",
            },
            {
              name: "Get Citation Tracker",
              value: "getCitationTracker",
              description: "Read one citation tracker",
              action: "Get a citation tracker",
            },
            {
              name: "Update Citation Tracker",
              value: "updateCitationTracker",
              description: "Edit a tracker's prompts, engines, competitors, samples, cadence or webhook",
              action: "Update a citation tracker",
            },
            {
              name: "Delete Citation Tracker",
              value: "deleteCitationTracker",
              description: "Stop tracking a brand (run history is kept until its retention expires)",
              action: "Delete a citation tracker",
            },
            {
              name: "Run Citation Tracker",
              value: "runCitationTracker",
              description: "Run a tracker now; every prompt x engine x sample counts as one check",
              action: "Run a citation tracker",
            },
            {
              name: "Get Citation Run",
              value: "getCitationRun",
              description: "Run status plus every per-prompt, per-engine result",
              action: "Get a citation run",
            },
            {
              name: "Citation Tracker History",
              value: "citationTrackerHistory",
              description: "Timeseries of mention rate, citation rate, share of voice and average position",
              action: "Get citation tracker history",
            },
            {
              name: "Citation Check",
              value: "citationCheck",
              description: "One-off citation check for a brand and one prompt, metered per check (paid plans only)",
              action: "Run a citation check",
            },
            {
              name: "Citation Top-Ups",
              value: "citationTopups",
              description: "Top-up packs for citation checks and this account's balance",
              action: "Get citation top-ups",
            },
            {
              name: "Citation Top-Up Checkout",
              value: "citationTopupCheckout",
              description: "Create a Stripe Checkout link for a pack of top-up checks (paid plans; nothing is charged until the link is paid)",
              action: "Create a citation top-up checkout link",
            },
            {
              name: "Citation Auto-Reload (Read)",
              value: "citationAutoReload",
              description: "Read the auto-reload setting and this month's use (it can only be changed from the dashboard)",
              action: "Get citation auto-reload setting",
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
          displayName: "Include Core Web Vitals",
          name: "includeCoreWebVitals",
          type: "boolean",
          default: false,
          displayOptions: { show: { operation: ["audit", "batchAudit"] } },
          description:
            "Whether to also measure Core Web Vitals (LCP, INP, CLS) with Google PageSpeed Insights. Adds about 10 seconds per new URL; results are cached for 24 hours.",
        },
        {
          displayName: "Opt Out",
          name: "optOut",
          type: "boolean",
          default: true,
          displayOptions: { show: { operation: ["scoreboardOptOut"] } },
          description: "True to hide from scoreboard, false to show",
        },
        {
          displayName: "URL",
          name: "historyUrl",
          type: "string",
          default: "",
          required: true,
          displayOptions: { show: { operation: ["history"] } },
          placeholder: "https://example.com",
          description: "URL whose audit history to fetch",
        },
        {
          displayName: "Limit",
          name: "historyLimit",
          type: "number",
          default: 100,
          typeOptions: { minValue: 1, maxValue: 1000 },
          displayOptions: { show: { operation: ["history"] } },
          description: "Maximum number of points to return (1–1000)",
        },
        {
          displayName: "URLs",
          name: "compareUrls",
          type: "string",
          default: "",
          required: true,
          displayOptions: { show: { operation: ["compare"] } },
          placeholder: "https://a.com, https://b.com",
          description: "Comma-separated list of 2–5 URLs to compare",
        },
        {
          displayName: "URL",
          name: "deepAuditUrl",
          type: "string",
          default: "",
          required: true,
          displayOptions: { show: { operation: ["deepAudit", "startDeepAudit"] } },
          placeholder: "https://example.com",
          description: "URL to run a deep AI audit on",
        },
        {
          displayName: "Business Type",
          name: "businessType",
          type: "options",
          default: "",
          displayOptions: { show: { operation: ["deepAudit", "startDeepAudit"] } },
          description: "Optional — tunes which checks apply to the site",
          options: [
            { name: "Auto-detect", value: "" },
            { name: "SaaS", value: "saas" },
            { name: "Local Service", value: "local_service" },
            { name: "E-commerce", value: "ecommerce" },
            { name: "Storefront", value: "storefront" },
            { name: "Blog", value: "blog" },
            { name: "Publisher", value: "publisher" },
          ],
        },
        {
          displayName: "Webhook URL",
          name: "deepAuditWebhookUrl",
          type: "string",
          default: "",
          displayOptions: { show: { operation: ["startDeepAudit"] } },
          placeholder: "https://your-n8n.example/webhook/deep-audit",
          description: "Optional — public URL POSTed once when the job completes (no retries; poll with Get Deep Audit as the source of truth)",
        },
        {
          displayName: "Timeout (Seconds)",
          name: "deepAuditTimeout",
          type: "number",
          default: 600,
          typeOptions: { minValue: 30, maxValue: 3600 },
          displayOptions: { show: { operation: ["deepAudit"] } },
          description: "How long to wait for the audit before failing (queued jobs can take a few minutes)",
        },
        {
          displayName: "Job ID",
          name: "deepAuditJobId",
          type: "string",
          default: "",
          required: true,
          displayOptions: { show: { operation: ["getDeepAudit"] } },
          description: "The job_id returned by Start Deep Audit",
        },
        {
          displayName: "URL",
          name: "targetUrl",
          type: "string",
          default: "",
          required: true,
          displayOptions: {
            show: {
              operation: ["accessibilityAudit", "exportAudit", "aiReadability", "trackers", "conversion", "geoAudit", "addGeoMonitor", "removeGeoMonitor", "crawl", "startCrawl"],
            },
          },
          placeholder: "https://example.com",
          description: "The page (or, for a crawl, the site's starting URL)",
        },
        {
          displayName: "Include Trackers",
          name: "includeTrackers",
          type: "boolean",
          default: false,
          displayOptions: { show: { operation: ["accessibilityAudit"] } },
          description: "Whether to add the tracker and pixel inventory to the report",
        },
        {
          displayName: "Format",
          name: "exportFormat",
          type: "options",
          default: "pdf",
          displayOptions: { show: { operation: ["exportAudit"] } },
          options: [
            { name: "PDF", value: "pdf" },
            { name: "Markdown", value: "md" },
            { name: "CSV", value: "csv" },
          ],
        },
        {
          displayName: "Brand Name",
          name: "brandName",
          type: "string",
          default: "",
          displayOptions: { show: { operation: ["exportAudit"] } },
          description: "White-label: your agency name (Pro and Ultra)",
        },
        {
          displayName: "Brand Color",
          name: "brandColor",
          type: "string",
          default: "",
          displayOptions: { show: { operation: ["exportAudit"] } },
          placeholder: "#112233",
          description: "White-label: accent colour, #rrggbb (Pro and Ultra)",
        },
        {
          displayName: "Logo URL",
          name: "logoUrl",
          type: "string",
          default: "",
          displayOptions: { show: { operation: ["exportAudit"] } },
          description: "White-label: https URL of a PNG/JPEG/WebP logo, max 300 KB (Pro and Ultra)",
        },
        {
          displayName: "Put Output File in Field",
          name: "binaryPropertyName",
          type: "string",
          default: "data",
          displayOptions: { show: { operation: ["exportAudit"] } },
          description: "Name of the binary property the report file is written to",
        },
        {
          displayName: "Page Type",
          name: "pageType",
          type: "options",
          default: "",
          displayOptions: { show: { operation: ["conversion"] } },
          options: [
            { name: "Auto-detect", value: "" },
            { name: "Local Service", value: "local_service" },
            { name: "E-commerce", value: "ecommerce" },
            { name: "SaaS", value: "saas" },
            { name: "General", value: "general" },
          ],
        },
        {
          displayName: "Your URL",
          name: "competitiveUrl",
          type: "string",
          default: "",
          required: true,
          displayOptions: { show: { operation: ["competitiveAudit"] } },
          placeholder: "https://yoursite.com/page",
        },
        {
          displayName: "Competitor URL",
          name: "competitorUrl",
          type: "string",
          default: "",
          required: true,
          displayOptions: { show: { operation: ["competitiveAudit"] } },
          placeholder: "https://competitor.com/page",
        },
        {
          displayName: "Keyword",
          name: "keyword",
          type: "string",
          default: "",
          required: true,
          displayOptions: { show: { operation: ["competitiveAudit"] } },
          description: "Target keyword to compare on (max 200 characters)",
        },
        {
          displayName: "Domain",
          name: "domain",
          type: "string",
          default: "",
          required: true,
          displayOptions: { show: { operation: ["backlinks", "llmsTxt", "citationSuggestPrompts"] } },
          placeholder: "example.com",
        },
        {
          displayName: "Limit",
          name: "backlinksLimit",
          type: "number",
          default: 50,
          typeOptions: { minValue: 1, maxValue: 500 },
          displayOptions: { show: { operation: ["backlinks"] } },
          description: "Max sample rows to return (1–500)",
        },
        {
          displayName: "Source",
          name: "quickWinsSource",
          type: "options",
          default: "csv",
          displayOptions: { show: { operation: ["quickWins"] } },
          options: [
            { name: "CSV Export (Text)", value: "csv" },
            { name: "Rows (JSON)", value: "rows" },
          ],
          description: "We do not connect to your Search Console: send the Performance export or the rows",
        },
        {
          displayName: "CSV",
          name: "quickWinsCsv",
          type: "string",
          typeOptions: { rows: 6 },
          default: "",
          displayOptions: { show: { operation: ["quickWins"], quickWinsSource: ["csv"] } },
          description: "The Search Console Performance export as text, with a header row",
        },
        {
          displayName: "Rows",
          name: "quickWinsRows",
          type: "json",
          default: "[]",
          displayOptions: { show: { operation: ["quickWins"], quickWinsSource: ["rows"] } },
          description: "Array of {query, page, clicks, impressions, position}",
        },
        {
          displayName: "Options",
          name: "quickWinsOptions",
          type: "json",
          default: "{}",
          displayOptions: { show: { operation: ["quickWins"] } },
          description: "Optional: min_impressions (default 50), target_position (1-10, default 5), limit (default 25, max 200), exclude_terms, ctr_curve",
        },
        {
          displayName: "Brand",
          name: "brand",
          type: "string",
          default: "",
          displayOptions: { show: { operation: ["geoBrandProbe", "createCitationTracker", "citationCheck", "citationStarterPrompts"] } },
          description: "Your brand name (required except for Citation Starter Prompts)",
        },
        {
          displayName: "Brand Domain",
          name: "brandDomain",
          type: "string",
          default: "",
          required: true,
          displayOptions: { show: { operation: ["geoBrandProbe"] } },
          placeholder: "mybrand.com",
        },
        {
          displayName: "Prompts",
          name: "prompts",
          type: "string",
          typeOptions: { rows: 5 },
          default: "",
          displayOptions: { show: { operation: ["geoBrandProbe", "createCitationTracker"] } },
          description: "One prompt per line. For a citation tracker, leave empty and set Starter Topic to have a starter set generated.",
        },
        {
          displayName: "Models",
          name: "models",
          type: "string",
          default: "",
          displayOptions: { show: { operation: ["geoBrandProbe"] } },
          placeholder: "claude, nova",
          description: "Optional comma-separated models",
        },
        {
          displayName: "Runs per Prompt",
          name: "runsPerPrompt",
          type: "number",
          default: 3,
          displayOptions: { show: { operation: ["geoBrandProbe"] } },
        },
        {
          displayName: "Frequency",
          name: "geoFrequency",
          type: "options",
          default: "weekly",
          displayOptions: { show: { operation: ["addGeoMonitor"] } },
          options: [
            { name: "Weekly", value: "weekly" },
            { name: "Daily", value: "daily" },
          ],
          description: "The Basic plan runs weekly",
        },
        {
          displayName: "Alert Threshold",
          name: "geoAlertThreshold",
          type: "number",
          default: -5,
          displayOptions: { show: { operation: ["addGeoMonitor"] } },
        },
        {
          displayName: "Webhook URL",
          name: "geoWebhookUrl",
          type: "string",
          default: "",
          displayOptions: { show: { operation: ["addGeoMonitor"] } },
        },
        {
          displayName: "Monitor ID",
          name: "geoMonitorId",
          type: "number",
          default: 0,
          required: true,
          displayOptions: { show: { operation: ["geoMonitorHistory"] } },
          description: "The monitor's ID from List GEO Monitors",
        },
        {
          displayName: "Page",
          name: "page",
          type: "number",
          default: 1,
          typeOptions: { minValue: 1 },
          displayOptions: { show: { operation: ["geoMonitorHistory"] } },
        },
        {
          displayName: "Per Page",
          name: "perPage",
          type: "number",
          default: 20,
          typeOptions: { minValue: 1, maxValue: 100 },
          displayOptions: { show: { operation: ["geoMonitorHistory"] } },
        },
        {
          displayName: "Max Pages",
          name: "maxPages",
          type: "number",
          default: 0,
          typeOptions: { minValue: 0, maxValue: 100 },
          displayOptions: { show: { operation: ["crawl", "startCrawl"] } },
          description: "Fewer pages than your plan's cap. 0 uses the plan's cap.",
        },
        {
          displayName: "Timeout (Seconds)",
          name: "crawlTimeout",
          type: "number",
          default: 600,
          typeOptions: { minValue: 30, maxValue: 3600 },
          displayOptions: { show: { operation: ["crawl"] } },
          description: "How long to wait for the crawl before failing (the crawl keeps running)",
        },
        {
          displayName: "Job ID",
          name: "crawlJobId",
          type: "string",
          default: "",
          required: true,
          displayOptions: { show: { operation: ["getCrawl"] } },
          description: "The job_id returned by Start Site Crawl",
        },
        {
          displayName: "Topic",
          name: "starterTopic",
          type: "string",
          default: "",
          displayOptions: { show: { operation: ["citationStarterPrompts", "createCitationTracker"] } },
          placeholder: "SEO audit API",
          description: "What you sell, as a buyer would type it, singular. Required for Citation Starter Prompts; on Create Citation Tracker it is used only when Prompts is empty.",
        },
        {
          displayName: "Audience",
          name: "starterAudience",
          type: "string",
          default: "",
          displayOptions: { show: { operation: ["citationStarterPrompts", "createCitationTracker"] } },
          placeholder: "marketing agencies",
          description: "Who buys it, plural",
        },
        {
          displayName: "Features",
          name: "starterFeatures",
          type: "string",
          default: "",
          displayOptions: { show: { operation: ["citationStarterPrompts"] } },
          description: "Comma-separated features buyers ask about (up to 6)",
        },
        {
          displayName: "Use Cases",
          name: "starterUseCases",
          type: "string",
          default: "",
          displayOptions: { show: { operation: ["citationStarterPrompts"] } },
          description: "Comma-separated jobs it is bought for (up to 6)",
        },
        {
          displayName: "Prompts per Category",
          name: "perCategory",
          type: "number",
          default: 2,
          typeOptions: { minValue: 1, maxValue: 10 },
          displayOptions: { show: { operation: ["citationStarterPrompts"] } },
          description: "Default 2 = 12 prompts; 3 = 18",
        },
        {
          displayName: "Limit",
          name: "promptLimit",
          type: "number",
          default: 0,
          typeOptions: { minValue: 0, maxValue: 60 },
          displayOptions: { show: { operation: ["citationStarterPrompts"] } },
          description: "Cut the list to this many, keeping the spread across categories. 0 = no cut.",
        },
        {
          displayName: "Prompt",
          name: "citationPrompt",
          type: "string",
          default: "",
          required: true,
          displayOptions: { show: { operation: ["citationCheck"] } },
          placeholder: "best CRM for agencies",
        },
        {
          displayName: "Domains",
          name: "citationDomains",
          type: "string",
          default: "",
          displayOptions: { show: { operation: ["createCitationTracker", "citationCheck"] } },
          placeholder: "acme.com",
          description: "Comma-separated domains that count as yours",
        },
        {
          displayName: "Competitors",
          name: "citationCompetitors",
          type: "string",
          default: "",
          displayOptions: { show: { operation: ["createCitationTracker", "citationCheck", "citationStarterPrompts"] } },
          description: "Comma-separated competitor names",
        },
        {
          displayName: "Engines",
          name: "citationEngines",
          type: "multiOptions",
          default: [],
          displayOptions: { show: { operation: ["createCitationTracker", "citationCheck"] } },
          options: [
            { name: "ChatGPT", value: "chatgpt" },
            { name: "Gemini", value: "gemini" },
            { name: "Perplexity", value: "perplexity" },
            { name: "Claude", value: "claude" },
          ],
          description: "Leave empty for the API default",
        },
        {
          displayName: "Samples",
          name: "citationSamples",
          type: "number",
          default: 0,
          typeOptions: { minValue: 0, maxValue: 5 },
          displayOptions: { show: { operation: ["createCitationTracker", "citationCheck"] } },
          description: "Samples per prompt per engine. 0 uses the API default.",
        },
        {
          displayName: "Cadence",
          name: "citationCadence",
          type: "options",
          default: "",
          displayOptions: { show: { operation: ["createCitationTracker"] } },
          options: [
            { name: "API Default", value: "" },
            { name: "Daily", value: "daily" },
            { name: "Weekly", value: "weekly" },
            { name: "Monthly", value: "monthly" },
            { name: "Manual", value: "manual" },
          ],
        },
        {
          displayName: "Webhook URL",
          name: "citationWebhookUrl",
          type: "string",
          default: "",
          displayOptions: { show: { operation: ["createCitationTracker"] } },
          description: "Optional https URL",
        },
        {
          displayName: "Tracker ID",
          name: "trackerId",
          type: "number",
          default: 0,
          required: true,
          displayOptions: {
            show: { operation: ["getCitationTracker", "updateCitationTracker", "deleteCitationTracker", "runCitationTracker", "citationTrackerHistory"] },
          },
        },
        {
          displayName: "Fields to Update",
          name: "trackerUpdateFields",
          type: "json",
          default: "{}",
          displayOptions: { show: { operation: ["updateCitationTracker"] } },
          description: "JSON with any of: prompts, engines, competitors, samples, cadence, webhook_url. Only the fields you send change.",
        },
        {
          displayName: "Run ID",
          name: "runId",
          type: "number",
          default: 0,
          required: true,
          displayOptions: { show: { operation: ["getCitationRun"] } },
        },
        {
          displayName: "Days",
          name: "historyDays",
          type: "number",
          default: 90,
          typeOptions: { minValue: 1, maxValue: 365 },
          displayOptions: { show: { operation: ["citationTrackerHistory"] } },
        },
        {
          displayName: "Pack",
          name: "topupPack",
          type: "string",
          default: "500",
          required: true,
          displayOptions: { show: { operation: ["citationTopupCheckout"] } },
          description: "A pack key from Citation Top-Ups (the number of checks, e.g. 500 or 2000)",
        },
      ],
    };
  }

  async execute() {
    const items = this.getInputData();
    const operation = this.getNodeParameter("operation", 0);
    const credentials = await this.getCredentials("seoScoreApi");
    const returnData = [];
    const ua = `seoscoreapi-n8n/${VERSION}`;
    const deepBase = String(credentials.deepAuditBaseUrl || DEFAULT_DEEP_AUDIT_URL).replace(/\/+$/, "");
    const pollMs = SeoScoreApi.pollIntervalMs;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const getJob = (jobId) => this.helpers.request({
      method: "GET",
      url: `${deepBase}/site-audit/${encodeURIComponent(jobId)}`,
      headers: { "X-API-Key": credentials.apiKey, "User-Agent": ua },
      json: true,
    });
    const startJob = (body) => this.helpers.request({
      method: "POST",
      url: `${deepBase}/site-audit`,
      headers: { "X-API-Key": credentials.apiKey, "Content-Type": "application/json", "User-Agent": ua },
      body,
      json: true,
    });

    // Main-host call for the operations below. Unset query values are dropped.
    const api = (method, path, { qs, body, raw } = {}) => {
      const opts = { method, url: `${API_URL}${path}`, headers: { "X-API-Key": credentials.apiKey, "User-Agent": ua }, json: true };
      if (qs) {
        opts.qs = {};
        for (const [k, v] of Object.entries(qs)) if (v !== undefined && v !== null && v !== "") opts.qs[k] = v;
      }
      if (body !== undefined) {
        opts.headers["Content-Type"] = "application/json";
        opts.body = body;
      }
      if (raw === "buffer") { opts.json = false; opts.encoding = null; }
      if (raw === "text") opts.json = false;
      return this.helpers.request(opts);
    };
    const list = (value, sep = ",") => String(value || "").split(sep).map((v) => v.trim()).filter(Boolean);
    const parseJson = (value, label) => {
      if (typeof value !== "string") return value;
      if (!value.trim()) return undefined;
      try {
        return JSON.parse(value);
      } catch {
        throw new Error(`${label} must be valid JSON`);
      }
    };
    const startCrawl = (i) => {
      const body = { url: this.getNodeParameter("targetUrl", i) };
      const maxPages = this.getNodeParameter("maxPages", i, 0);
      if (maxPages) body.max_pages = maxPages;
      return api("POST", "/crawl", { body });
    };

    for (let i = 0; i < items.length; i++) {
      let response;
      let binary;

      if (operation === "audit") {
        const url = this.getNodeParameter("url", i);
        const cwv = this.getNodeParameter("includeCoreWebVitals", i, false) === true;
        response = await this.helpers.request({
          method: "GET",
          url: `https://seoscoreapi.com/audit`,
          qs: cwv ? { url, cwv: "true" } : { url },
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
          body: this.getNodeParameter("includeCoreWebVitals", i, false) === true ? { urls, cwv: true } : { urls },
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
      } else if (operation === "history") {
        const url = this.getNodeParameter("historyUrl", i);
        const limit = this.getNodeParameter("historyLimit", i);
        response = await this.helpers.request({
          method: "GET",
          url: "https://seoscoreapi.com/history",
          qs: { url, limit },
          headers: { "X-API-Key": credentials.apiKey, "User-Agent": ua },
          json: true,
        });
      } else if (operation === "historyDomains") {
        response = await this.helpers.request({
          method: "GET",
          url: "https://seoscoreapi.com/history/domains",
          headers: { "X-API-Key": credentials.apiKey, "User-Agent": ua },
          json: true,
        });
      } else if (operation === "compare") {
        const urlsStr = this.getNodeParameter("compareUrls", i);
        const urls = urlsStr.split(",").map((u) => u.trim()).filter(Boolean);
        response = await this.helpers.request({
          method: "POST",
          url: "https://seoscoreapi.com/compare",
          headers: {
            "X-API-Key": credentials.apiKey,
            "Content-Type": "application/json",
            "User-Agent": ua,
          },
          body: { urls },
          json: true,
        });
      } else if (operation === "deepAudit") {
        const url = this.getNodeParameter("deepAuditUrl", i);
        const businessType = this.getNodeParameter("businessType", i);
        const timeoutS = this.getNodeParameter("deepAuditTimeout", i, 600);
        const body = { url };
        if (businessType) body.business_type = businessType;
        const job = await startJob(body);
        const deadline = Date.now() + timeoutS * 1000;
        for (;;) {
          if (Date.now() > deadline) throw new Error(`Deep audit timed out after ${timeoutS} seconds (job ${job.job_id})`);
          await sleep(pollMs);
          const s = await getJob(job.job_id);
          if (s.status === "completed") { response = s.result; break; }
          if (s.status === "failed") throw new Error(s.error || "Deep audit failed");
        }
      } else if (operation === "startDeepAudit") {
        const url = this.getNodeParameter("deepAuditUrl", i);
        const businessType = this.getNodeParameter("businessType", i);
        const webhookUrl = this.getNodeParameter("deepAuditWebhookUrl", i, "");
        const body = { url };
        if (businessType) body.business_type = businessType;
        if (webhookUrl) body.webhook_url = webhookUrl;
        response = await startJob(body);
      } else if (operation === "getDeepAudit") {
        response = await getJob(this.getNodeParameter("deepAuditJobId", i));
      } else if (operation === "deepAuditUsage") {
        response = await this.helpers.request({
          method: "GET",
          url: `${deepBase}${deepAuditUsagePath(deepBase)}`,
          headers: { "X-API-Key": credentials.apiKey, "User-Agent": ua },
          json: true,
        });
      } else if (operation === "competitiveAudit") {
        response = await api("POST", "/audit/competitive", {
          body: {
            url: this.getNodeParameter("competitiveUrl", i),
            competitor_url: this.getNodeParameter("competitorUrl", i),
            keyword: this.getNodeParameter("keyword", i),
          },
        });
      } else if (operation === "accessibilityAudit") {
        const include = this.getNodeParameter("includeTrackers", i, false) ? "trackers" : undefined;
        response = await api("GET", "/audit/accessibility", { qs: { url: this.getNodeParameter("targetUrl", i), include } });
      } else if (operation === "exportAudit") {
        const format = this.getNodeParameter("exportFormat", i, "pdf");
        const url = this.getNodeParameter("targetUrl", i);
        const file = await api("GET", "/audit/export", {
          raw: "buffer",
          qs: {
            url,
            format,
            brand_name: this.getNodeParameter("brandName", i, ""),
            brand_color: this.getNodeParameter("brandColor", i, ""),
            logo_url: this.getNodeParameter("logoUrl", i, ""),
          },
        });
        const mime = { pdf: "application/pdf", md: "text/markdown", csv: "text/csv" }[format];
        let host = "report";
        try {
          host = new URL(/^[a-z]+:\/\//i.test(url) ? url : `https://${url}`).hostname || host;
        } catch {
          // keep the generic name
        }
        const fileName = `seo-report-${host}.${format}`;
        const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file);
        const property = this.getNodeParameter("binaryPropertyName", i, "data") || "data";
        binary = { [property]: await this.helpers.prepareBinaryData(buffer, fileName, mime) };
        response = { url, format, fileName, bytes: buffer.length };
      } else if (operation === "aiReadability") {
        response = await api("GET", "/ai-readability", { qs: { url: this.getNodeParameter("targetUrl", i) } });
      } else if (operation === "trackers") {
        response = await api("GET", "/trackers", { qs: { url: this.getNodeParameter("targetUrl", i) } });
      } else if (operation === "conversion") {
        response = await api("GET", "/conversion", {
          qs: { url: this.getNodeParameter("targetUrl", i), page_type: this.getNodeParameter("pageType", i, "") },
        });
      } else if (operation === "quickWins") {
        const body = parseJson(this.getNodeParameter("quickWinsOptions", i, "{}"), "Options") || {};
        if (this.getNodeParameter("quickWinsSource", i, "csv") === "rows") {
          body.rows = parseJson(this.getNodeParameter("quickWinsRows", i, "[]"), "Rows") || [];
        } else {
          body.csv = this.getNodeParameter("quickWinsCsv", i, "");
        }
        response = await api("POST", "/quick-wins", { body });
      } else if (operation === "backlinks") {
        response = await api("GET", "/backlinks", {
          qs: { domain: this.getNodeParameter("domain", i), limit: this.getNodeParameter("backlinksLimit", i, 50) },
        });
      } else if (operation === "llmsTxt") {
        const domain = this.getNodeParameter("domain", i);
        const text = await api("GET", "/llms-generator", { raw: "text", qs: { domain } });
        response = { domain, llms_txt: String(text) };
      } else if (operation === "geoAudit") {
        response = await api("GET", "/geo/audit", { qs: { url: this.getNodeParameter("targetUrl", i) } });
      } else if (operation === "geoBrandProbe") {
        const body = {
          brand: this.getNodeParameter("brand", i),
          domain: this.getNodeParameter("brandDomain", i),
          prompts: list(this.getNodeParameter("prompts", i, ""), "\n"),
        };
        const models = list(this.getNodeParameter("models", i, ""));
        if (models.length) body.models = models;
        const runs = this.getNodeParameter("runsPerPrompt", i, 3);
        if (runs) body.runs_per_prompt = runs;
        response = await api("POST", "/geo/brand-probe", { body });
      } else if (operation === "addGeoMonitor") {
        const body = {
          url: this.getNodeParameter("targetUrl", i),
          frequency: this.getNodeParameter("geoFrequency", i, "weekly"),
          alert_threshold: this.getNodeParameter("geoAlertThreshold", i, -5),
        };
        const webhookUrl = this.getNodeParameter("geoWebhookUrl", i, "");
        if (webhookUrl) body.webhook_url = webhookUrl;
        response = await api("POST", "/geo/monitor", { body });
      } else if (operation === "listGeoMonitors") {
        response = await api("GET", "/geo/monitors");
      } else if (operation === "geoMonitorHistory") {
        response = await api("GET", `/geo/monitor/${encodeURIComponent(this.getNodeParameter("geoMonitorId", i))}/history`, {
          qs: { page: this.getNodeParameter("page", i, 1), per_page: this.getNodeParameter("perPage", i, 20) },
        });
      } else if (operation === "removeGeoMonitor") {
        response = await api("DELETE", "/geo/monitor", { body: { url: this.getNodeParameter("targetUrl", i) } });
      } else if (operation === "crawl") {
        const timeoutS = this.getNodeParameter("crawlTimeout", i, 600);
        const job = await startCrawl(i);
        const deadline = Date.now() + timeoutS * 1000;
        for (;;) {
          if (Date.now() > deadline) throw new Error(`Site crawl timed out after ${timeoutS} seconds (job ${job.job_id})`);
          await sleep(pollMs);
          const s = await api("GET", `/crawl/${encodeURIComponent(job.job_id)}`);
          if (s.status === "completed") { response = s; break; }
          if (s.status === "failed") throw new Error(s.error || "Site crawl failed");
        }
      } else if (operation === "startCrawl") {
        response = await startCrawl(i);
      } else if (operation === "getCrawl") {
        response = await api("GET", `/crawl/${encodeURIComponent(this.getNodeParameter("crawlJobId", i))}`);
      } else if (operation === "citationStarterPrompts") {
        response = await api("GET", "/citations/prompts/starter", {
          qs: {
            topic: this.getNodeParameter("starterTopic", i),
            brand: this.getNodeParameter("brand", i, ""),
            competitors: list(this.getNodeParameter("citationCompetitors", i, "")).join(","),
            audience: this.getNodeParameter("starterAudience", i, ""),
            features: list(this.getNodeParameter("starterFeatures", i, "")).join(","),
            use_cases: list(this.getNodeParameter("starterUseCases", i, "")).join(","),
            per_category: this.getNodeParameter("perCategory", i, 2),
            limit: this.getNodeParameter("promptLimit", i, 0) || undefined,
          },
        });
      } else if (operation === "citationSuggestPrompts") {
        response = await api("GET", "/citations/prompts/suggest", { qs: { domain: this.getNodeParameter("domain", i) } });
      } else if (operation === "createCitationTracker" || operation === "citationCheck") {
        const body = { brand: this.getNodeParameter("brand", i) };
        const domains = list(this.getNodeParameter("citationDomains", i, ""));
        if (domains.length) body.domains = domains;
        const competitors = list(this.getNodeParameter("citationCompetitors", i, ""));
        if (competitors.length) body.competitors = competitors;
        const engines = this.getNodeParameter("citationEngines", i, []);
        if (engines && engines.length) body.engines = engines;
        const samples = this.getNodeParameter("citationSamples", i, 0);
        if (samples) body.samples = samples;
        if (operation === "citationCheck") {
          body.prompt = this.getNodeParameter("citationPrompt", i);
          response = await api("POST", "/citations/check", { body });
        } else {
          const prompts = list(this.getNodeParameter("prompts", i, ""), "\n");
          const topic = this.getNodeParameter("starterTopic", i, "");
          if (prompts.length) {
            body.prompts = prompts;
          } else if (topic) {
            body.starter = { topic };
            const audience = this.getNodeParameter("starterAudience", i, "");
            if (audience) body.starter.audience = audience;
          }
          const cadence = this.getNodeParameter("citationCadence", i, "");
          if (cadence) body.cadence = cadence;
          const webhookUrl = this.getNodeParameter("citationWebhookUrl", i, "");
          if (webhookUrl) body.webhook_url = webhookUrl;
          response = await api("POST", "/citations/trackers", { body });
        }
      } else if (operation === "listCitationTrackers") {
        response = await api("GET", "/citations/trackers");
      } else if (operation === "getCitationTracker") {
        response = await api("GET", `/citations/trackers/${encodeURIComponent(this.getNodeParameter("trackerId", i))}`);
      } else if (operation === "updateCitationTracker") {
        const body = parseJson(this.getNodeParameter("trackerUpdateFields", i, "{}"), "Fields to Update") || {};
        response = await api("PATCH", `/citations/trackers/${encodeURIComponent(this.getNodeParameter("trackerId", i))}`, { body });
      } else if (operation === "deleteCitationTracker") {
        response = await api("DELETE", `/citations/trackers/${encodeURIComponent(this.getNodeParameter("trackerId", i))}`);
      } else if (operation === "runCitationTracker") {
        response = await api("POST", `/citations/trackers/${encodeURIComponent(this.getNodeParameter("trackerId", i))}/run`);
      } else if (operation === "getCitationRun") {
        response = await api("GET", `/citations/runs/${encodeURIComponent(this.getNodeParameter("runId", i))}`);
      } else if (operation === "citationTrackerHistory") {
        response = await api("GET", `/citations/trackers/${encodeURIComponent(this.getNodeParameter("trackerId", i))}/history`, {
          qs: { days: this.getNodeParameter("historyDays", i, 90) },
        });
      } else if (operation === "citationTopups") {
        response = await api("GET", "/citations/topups");
      } else if (operation === "citationTopupCheckout") {
        response = await api("POST", "/citations/topups/checkout", { body: { pack: String(this.getNodeParameter("topupPack", i)) } });
      } else if (operation === "citationAutoReload") {
        response = await api("GET", "/citations/auto-reload");
      }

      returnData.push(binary ? { json: response, binary } : { json: response });
    }

    return [returnData];
  }
}

SeoScoreApi.pollIntervalMs = 5000;

module.exports = { nodeClass: SeoScoreApi };
