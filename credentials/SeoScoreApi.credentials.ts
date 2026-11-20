import type { ICredentialTestRequest, ICredentialType, Icon, INodeProperties } from 'n8n-workflow';

export class SeoScoreApi implements ICredentialType {
	name = 'seoScoreApi';

	displayName = 'SEO Score API';

	icon: Icon = 'file:../icons/seoscoreapi.svg';

	documentationUrl = 'https://seoscoreapi.com/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your SEO Score API key. Get one free at https://seoscoreapi.com',
		},
		{
			displayName: 'Deep Audit Base URL',
			name: 'deepAuditBaseUrl',
			type: 'string',
			default: 'https://seoscoreapi.com',
			description:
				'Host for the Deep Audit operations. Leave as is unless you use a proxy or staging host (the legacy https://engine.seoscoreapi.com also works).',
		},
	];

	// "Test" on the credential screen checks the key against /usage, which spends no audits.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://seoscoreapi.com',
			url: '/usage',
			method: 'GET',
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
				'User-Agent': 'seoscoreapi-n8n/1.7.6',
			},
		},
	};
}

// n8n loads the class named after the file (SeoScoreApi.credentials.js -> SeoScoreApi).
// SeoScoreApiCredentials is the name 1.7.3 and earlier exported; kept for index and tests.
export { SeoScoreApi as SeoScoreApiCredentials };
