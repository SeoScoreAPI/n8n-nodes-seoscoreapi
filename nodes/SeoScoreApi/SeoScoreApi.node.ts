import {
	NodeApiError,
	NodeConnectionTypes,
	NodeOperationError,
	sleep,
	type IBinaryData,
	type IDataObject,
	type IExecuteFunctions,
	type IHttpRequestMethods,
	type IHttpRequestOptions,
	type JsonObject,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

import {
	fieldProperties,
	legacyOperationProperty,
	operationProperties,
	resourceProperty,
} from './descriptions';

const VERSION = '1.8.0';
const API_URL = 'https://seoscoreapi.com';
const DEFAULT_DEEP_AUDIT_URL = 'https://seoscoreapi.com';
const CREDENTIAL = 'seoScoreApi';

// Main host: /deep-audit/usage (its /usage is the per-URL allowance).
// Legacy engine.seoscoreapi.com: /usage.
function deepAuditUsagePath(base: string): string {
	return base.replace(/^[a-z]+:\/\//i, '').startsWith('engine.') ? '/usage' : '/deep-audit/usage';
}

function list(value: unknown, sep = ','): string[] {
	return String(value || '')
		.split(sep)
		.map((v) => v.trim())
		.filter(Boolean);
}

type RawMode = 'buffer' | 'text';

/** A parameter value, typed so it can go straight into a request body or query. */
type Value = IDataObject[string];

interface ApiOptions {
	qs?: IDataObject;
	body?: IDataObject;
	raw?: RawMode;
}

interface Job extends IDataObject {
	job_id?: string;
	status?: string;
	error?: string;
	result?: IDataObject;
}

export class SeoScoreApi implements INodeType {
	/** Delay between polls of a Deep Audit or crawl job. Tests lower it. */
	static pollIntervalMs = 5000;

	description: INodeTypeDescription = {
		displayName: 'SEO Score API',
		name: 'seoScoreApi',
		icon: {
			light: 'file:../../icons/seoscoreapi.svg',
			dark: 'file:../../icons/seoscoreapi.dark.svg',
		},
		group: ['transform'],
		version: [1, 2],
		defaultVersion: 2,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Audit any URL for SEO issues — 80+ checks, scored JSON response',
		defaults: { name: 'SEO Score API' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: CREDENTIAL,
				required: true,
			},
		],
		properties: [
			resourceProperty,
			...operationProperties,
			legacyOperationProperty,
			...fieldProperties,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials(CREDENTIAL);
		const returnData: INodeExecutionData[] = [];
		const ua = `seoscoreapi-n8n/${VERSION}`;
		const deepBase = String(credentials.deepAuditBaseUrl || DEFAULT_DEEP_AUDIT_URL).replace(
			/\/+$/,
			'',
		);
		const pollMs = SeoScoreApi.pollIntervalMs;

		// Every request goes through the credential, which adds the X-API-Key header.
		const request = async (options: IHttpRequestOptions) =>
			await this.helpers.httpRequestWithAuthentication.call(this, CREDENTIAL, options);

		const getJob = async (jobId: string): Promise<Job> =>
			(await request({
				method: 'GET',
				url: `${deepBase}/site-audit/${encodeURIComponent(jobId)}`,
				headers: { 'User-Agent': ua },
				json: true,
			})) as Job;
		const startJob = async (body: IDataObject): Promise<Job> =>
			(await request({
				method: 'POST',
				url: `${deepBase}/site-audit`,
				headers: { 'Content-Type': 'application/json', 'User-Agent': ua },
				body,
				json: true,
			})) as Job;

		// Main-host call. Unset query values are dropped.
		const api = async (
			method: IHttpRequestMethods,
			path: string,
			{ qs, body, raw }: ApiOptions = {},
		): Promise<unknown> => {
			const headers: IDataObject = { 'User-Agent': ua };
			const opts: IHttpRequestOptions = { method, url: `${API_URL}${path}`, headers, json: true };
			if (qs) {
				const clean: IDataObject = {};
				for (const [k, v] of Object.entries(qs)) {
					if (v !== undefined && v !== null && v !== '') clean[k] = v;
				}
				opts.qs = clean;
			}
			if (body !== undefined) {
				headers['Content-Type'] = 'application/json';
				opts.body = body;
			}
			if (raw === 'buffer') {
				opts.json = false;
				opts.encoding = 'arraybuffer';
			}
			if (raw === 'text') {
				opts.json = false;
				opts.encoding = 'text';
			}
			return await request(opts);
		};

		const parseJson = (value: unknown, label: string, itemIndex: number): unknown => {
			if (typeof value !== 'string') return value;
			if (!value.trim()) return undefined;
			try {
				return JSON.parse(value);
			} catch {
				throw new NodeOperationError(this.getNode(), `${label} must be valid JSON`, {
					itemIndex,
					description: `Check the '${label}' parameter.`,
				});
			}
		};
		const startCrawl = async (i: number): Promise<Job> => {
			const body: IDataObject = { url: this.getNodeParameter('targetUrl', i) };
			const maxPages = this.getNodeParameter('maxPages', i, 0);
			if (maxPages) body.max_pages = maxPages;
			return (await api('POST', '/crawl', { body })) as Job;
		};
		const param = (name: string, i: number, fallback?: Value): Value =>
			(fallback === undefined
				? this.getNodeParameter(name, i)
				: this.getNodeParameter(name, i, fallback)) as Value;
		const id = (name: string, i: number) => encodeURIComponent(String(param(name, i)));

		for (let i = 0; i < items.length; i++) {
			try {
				let response: unknown;
				let binary: Record<string, IBinaryData> | undefined;

				if (operation === 'audit') {
					const url = param('url', i);
					const cwv = param('includeCoreWebVitals', i, false) === true;
					response = await request({
						method: 'GET',
						url: `${API_URL}/audit`,
						qs: cwv ? { url, cwv: 'true' } : { url },
						headers: { 'User-Agent': ua },
						json: true,
					});
				} else if (operation === 'batchAudit') {
					const urls = list(param('urls', i));
					response = await request({
						method: 'POST',
						url: `${API_URL}/audit/batch`,
						headers: { 'Content-Type': 'application/json', 'User-Agent': ua },
						body: param('includeCoreWebVitals', i, false) === true ? { urls, cwv: true } : { urls },
						json: true,
					});
				} else if (operation === 'usage') {
					response = await request({
						method: 'GET',
						url: `${API_URL}/usage`,
						headers: { 'User-Agent': ua },
						json: true,
					});
				} else if (operation === 'scoreboardOptOut') {
					const optOut = param('optOut', i);
					response = await request({
						method: 'PUT',
						url: `${API_URL}/scoreboard/opt-out?opt_out=${optOut}`,
						headers: { 'User-Agent': ua },
						json: true,
					});
				} else if (operation === 'history') {
					response = await request({
						method: 'GET',
						url: `${API_URL}/history`,
						qs: { url: param('historyUrl', i), limit: param('historyLimit', i) },
						headers: { 'User-Agent': ua },
						json: true,
					});
				} else if (operation === 'historyDomains') {
					response = await request({
						method: 'GET',
						url: `${API_URL}/history/domains`,
						headers: { 'User-Agent': ua },
						json: true,
					});
				} else if (operation === 'compare') {
					response = await request({
						method: 'POST',
						url: `${API_URL}/compare`,
						headers: { 'Content-Type': 'application/json', 'User-Agent': ua },
						body: { urls: list(param('compareUrls', i)) },
						json: true,
					});
				} else if (operation === 'deepAudit') {
					const businessType = param('businessType', i);
					const timeoutS = Number(param('deepAuditTimeout', i, 600));
					const body: IDataObject = { url: param('deepAuditUrl', i) };
					if (businessType) body.business_type = businessType;
					const job = await startJob(body);
					const deadline = Date.now() + timeoutS * 1000;
					for (;;) {
						if (Date.now() > deadline) {
							throw new NodeOperationError(
								this.getNode(),
								`Deep audit timed out after ${timeoutS} seconds (job ${job.job_id})`,
								{
									itemIndex: i,
									description:
										"Raise 'Timeout (Seconds)', or use Start Deep Audit and Get Deep Audit with the job ID.",
								},
							);
						}
						await sleep(pollMs);
						const s = await getJob(String(job.job_id));
						if (s.status === 'completed') {
							response = s.result;
							break;
						}
						if (s.status === 'failed') {
							throw new NodeOperationError(this.getNode(), s.error || 'Deep audit failed', {
								itemIndex: i,
							});
						}
					}
				} else if (operation === 'startDeepAudit') {
					const businessType = param('businessType', i);
					const webhookUrl = param('deepAuditWebhookUrl', i, '');
					const body: IDataObject = { url: param('deepAuditUrl', i) };
					if (businessType) body.business_type = businessType;
					if (webhookUrl) body.webhook_url = webhookUrl;
					response = await startJob(body);
				} else if (operation === 'getDeepAudit') {
					response = await getJob(String(param('deepAuditJobId', i)));
				} else if (operation === 'deepAuditUsage') {
					response = await request({
						method: 'GET',
						url: `${deepBase}${deepAuditUsagePath(deepBase)}`,
						headers: { 'User-Agent': ua },
						json: true,
					});
				} else if (operation === 'competitiveAudit') {
					response = await api('POST', '/audit/competitive', {
						body: {
							url: param('competitiveUrl', i),
							competitor_url: param('competitorUrl', i),
							keyword: param('keyword', i),
						},
					});
				} else if (operation === 'accessibilityAudit') {
					const include = param('includeTrackers', i, false) ? 'trackers' : undefined;
					response = await api('GET', '/audit/accessibility', {
						qs: { url: param('targetUrl', i), include },
					});
				} else if (operation === 'exportAudit') {
					const format = String(param('exportFormat', i, 'pdf'));
					const url = String(param('targetUrl', i));
					const file = await api('GET', '/audit/export', {
						raw: 'buffer',
						qs: {
							url,
							format,
							brand_name: param('brandName', i, ''),
							brand_color: param('brandColor', i, ''),
							logo_url: param('logoUrl', i, ''),
						},
					});
					const mime = (
						{ pdf: 'application/pdf', md: 'text/markdown', csv: 'text/csv' } as Record<
							string,
							string
						>
					)[format];
					let host = 'report';
					try {
						host = new URL(/^[a-z]+:\/\//i.test(url) ? url : `https://${url}`).hostname || host;
					} catch {
						// keep the generic name
					}
					const fileName = `seo-report-${host}.${format}`;
					const buffer = Buffer.isBuffer(file)
						? file
						: typeof file === 'string'
							? Buffer.from(file)
							: Buffer.from(file as ArrayBuffer);
					const property = String(param('binaryPropertyName', i, 'data') || 'data');
					binary = {
						[property]: await this.helpers.prepareBinaryData(buffer, fileName, mime),
					};
					response = { url, format, fileName, bytes: buffer.length };
				} else if (operation === 'aiReadability') {
					response = await api('GET', '/ai-readability', { qs: { url: param('targetUrl', i) } });
				} else if (operation === 'trackers') {
					response = await api('GET', '/trackers', { qs: { url: param('targetUrl', i) } });
				} else if (operation === 'conversion') {
					response = await api('GET', '/conversion', {
						qs: { url: param('targetUrl', i), page_type: param('pageType', i, '') },
					});
				} else if (operation === 'quickWins') {
					const body = (parseJson(param('quickWinsOptions', i, '{}'), 'Options', i) ||
						{}) as IDataObject;
					if (param('quickWinsSource', i, 'csv') === 'rows') {
						body.rows = (parseJson(param('quickWinsRows', i, '[]'), 'Rows', i) ||
							[]) as IDataObject[];
					} else {
						body.csv = param('quickWinsCsv', i, '');
					}
					response = await api('POST', '/quick-wins', { body });
				} else if (operation === 'backlinks') {
					response = await api('GET', '/backlinks', {
						qs: { domain: param('domain', i), limit: param('backlinksLimit', i, 50) },
					});
				} else if (operation === 'llmsTxt') {
					const domain = param('domain', i);
					const text = await api('GET', '/llms-generator', { raw: 'text', qs: { domain } });
					response = { domain, llms_txt: String(text) };
				} else if (operation === 'geoAudit') {
					response = await api('GET', '/geo/audit', { qs: { url: param('targetUrl', i) } });
				} else if (operation === 'geoBrandProbe') {
					const body: IDataObject = {
						brand: param('brand', i),
						domain: param('brandDomain', i),
						prompts: list(param('prompts', i, ''), '\n'),
					};
					const models = list(param('models', i, ''));
					if (models.length) body.models = models;
					const runs = param('runsPerPrompt', i, 3);
					if (runs) body.runs_per_prompt = runs;
					response = await api('POST', '/geo/brand-probe', { body });
				} else if (operation === 'addGeoMonitor') {
					const body: IDataObject = {
						url: param('targetUrl', i),
						frequency: param('geoFrequency', i, 'weekly'),
						alert_threshold: param('geoAlertThreshold', i, -5),
					};
					const webhookUrl = param('geoWebhookUrl', i, '');
					if (webhookUrl) body.webhook_url = webhookUrl;
					response = await api('POST', '/geo/monitor', { body });
				} else if (operation === 'listGeoMonitors') {
					response = await api('GET', '/geo/monitors');
				} else if (operation === 'geoMonitorHistory') {
					response = await api('GET', `/geo/monitor/${id('geoMonitorId', i)}/history`, {
						qs: { page: param('page', i, 1), per_page: param('perPage', i, 20) },
					});
				} else if (operation === 'removeGeoMonitor') {
					response = await api('DELETE', '/geo/monitor', { body: { url: param('targetUrl', i) } });
				} else if (operation === 'crawl') {
					const timeoutS = Number(param('crawlTimeout', i, 600));
					const job = await startCrawl(i);
					const deadline = Date.now() + timeoutS * 1000;
					for (;;) {
						if (Date.now() > deadline) {
							throw new NodeOperationError(
								this.getNode(),
								`Site crawl timed out after ${timeoutS} seconds (job ${job.job_id})`,
								{
									itemIndex: i,
									description:
										"Raise 'Timeout (Seconds)', or use Start Site Crawl and Get Site Crawl with the job ID.",
								},
							);
						}
						await sleep(pollMs);
						const s = (await api('GET', `/crawl/${encodeURIComponent(String(job.job_id))}`)) as Job;
						if (s.status === 'completed') {
							response = s;
							break;
						}
						if (s.status === 'failed') {
							throw new NodeOperationError(this.getNode(), s.error || 'Site crawl failed', {
								itemIndex: i,
							});
						}
					}
				} else if (operation === 'startCrawl') {
					response = await startCrawl(i);
				} else if (operation === 'getCrawl') {
					response = await api('GET', `/crawl/${id('crawlJobId', i)}`);
				} else if (operation === 'citationStarterPrompts') {
					response = await api('GET', '/citations/prompts/starter', {
						qs: {
							topic: param('starterTopic', i),
							brand: param('brand', i, ''),
							competitors: list(param('citationCompetitors', i, '')).join(','),
							audience: param('starterAudience', i, ''),
							features: list(param('starterFeatures', i, '')).join(','),
							use_cases: list(param('starterUseCases', i, '')).join(','),
							per_category: param('perCategory', i, 2),
							limit: param('promptLimit', i, 0) || undefined,
						},
					});
				} else if (operation === 'citationSuggestPrompts') {
					response = await api('GET', '/citations/prompts/suggest', {
						qs: { domain: param('domain', i) },
					});
				} else if (operation === 'createCitationTracker' || operation === 'citationCheck') {
					const body: IDataObject = { brand: param('brand', i) };
					const domains = list(param('citationDomains', i, ''));
					if (domains.length) body.domains = domains;
					const competitors = list(param('citationCompetitors', i, ''));
					if (competitors.length) body.competitors = competitors;
					const engines = param('citationEngines', i, []) as string[];
					if (engines && engines.length) body.engines = engines;
					const samples = param('citationSamples', i, 0);
					if (samples) body.samples = samples;
					if (operation === 'citationCheck') {
						body.prompt = param('citationPrompt', i);
						response = await api('POST', '/citations/check', { body });
					} else {
						const prompts = list(param('prompts', i, ''), '\n');
						const topic = param('starterTopic', i, '');
						if (prompts.length) {
							body.prompts = prompts;
						} else if (topic) {
							const starter: IDataObject = { topic };
							const audience = param('starterAudience', i, '');
							if (audience) starter.audience = audience;
							body.starter = starter;
						}
						const cadence = param('citationCadence', i, '');
						if (cadence) body.cadence = cadence;
						const webhookUrl = param('citationWebhookUrl', i, '');
						if (webhookUrl) body.webhook_url = webhookUrl;
						response = await api('POST', '/citations/trackers', { body });
					}
				} else if (operation === 'listCitationTrackers') {
					response = await api('GET', '/citations/trackers');
				} else if (operation === 'getCitationTracker') {
					response = await api('GET', `/citations/trackers/${id('trackerId', i)}`);
				} else if (operation === 'updateCitationTracker') {
					const body = (parseJson(param('trackerUpdateFields', i, '{}'), 'Fields to Update', i) ||
						{}) as IDataObject;
					response = await api('PATCH', `/citations/trackers/${id('trackerId', i)}`, { body });
				} else if (operation === 'deleteCitationTracker') {
					response = await api('DELETE', `/citations/trackers/${id('trackerId', i)}`);
				} else if (operation === 'runCitationTracker') {
					response = await api('POST', `/citations/trackers/${id('trackerId', i)}/run`);
				} else if (operation === 'getCitationRun') {
					response = await api('GET', `/citations/runs/${id('runId', i)}`);
				} else if (operation === 'citationTrackerHistory') {
					response = await api('GET', `/citations/trackers/${id('trackerId', i)}/history`, {
						qs: { days: param('historyDays', i, 90) },
					});
				} else if (operation === 'citationTopups') {
					response = await api('GET', '/citations/topups');
				} else if (operation === 'citationTopupCheckout') {
					response = await api('POST', '/citations/topups/checkout', {
						body: { pack: String(param('topupPack', i)) },
					});
				} else if (operation === 'citationAutoReload') {
					response = await api('GET', '/citations/auto-reload');
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`The operation "${operation}" is not supported`,
						{ itemIndex: i },
					);
				}

				const json = response as IDataObject;
				returnData.push(
					binary ? { json, binary, pairedItem: { item: i } } : { json, pairedItem: { item: i } },
				);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				// Both constructors hand back an error that is already of their own type.
				if (error instanceof NodeOperationError) {
					throw new NodeOperationError(this.getNode(), error, { itemIndex: i });
				}
				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
