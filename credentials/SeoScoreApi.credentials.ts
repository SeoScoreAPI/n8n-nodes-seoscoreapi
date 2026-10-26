import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SeoScoreApi implements ICredentialType {
	name = 'seoScoreApi';

	displayName = 'SEO Score API';

	icon: Icon = {
		light: 'file:../icons/seoscoreapi.svg',
		dark: 'file:../icons/seoscoreapi.dark.svg',
	};

	documentationUrl = 'https://seoscoreapi.com/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your SEO Score API key. Get one free at https://seoscoreapi.com.',
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

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://seoscoreapi.com',
			url: '/usage',
			method: 'GET',
		},
	};
}
