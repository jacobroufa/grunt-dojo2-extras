import request, { Response, RequestOptions } from '@dojo/core/request';
import GitHub, { AuthResponse } from './GitHub';
import { logger } from '../log';

function responseHandler(response: Response): Response {
	const statusCode = response.status;
	if (statusCode < 200 || statusCode >= 300) {
		const message = response.statusText;
		throw new Error(`Travis responded with ${ statusCode }. ${ message }`);
	}
	return response;
}

function getHeaders(token?: string): RequestOptions['headers'] {
	const headers: RequestOptions['headers'] = {
		Accept: 'application/vnd.travis-ci.2+json',
		'Content-type': 'application/json',
		'User-Agent': 'MyClient/1.0.0'
	};
	if (token) {
		headers.Authorization = `token ${ token }`;
	}
	return headers;
}

export interface AuthenticateResponse {
	access_token: string;
}

export interface FetchRepositoryResponse {
	repo: RepositoryData;
}

export default class Travis {
	token: string = null;

	private githubAuthorization: AuthResponse;

	async authenticate(githubToken: string): Promise<string> {
		const response = await request.post('https://api.travis-ci.org/auth/github', {
			body: JSON.stringify({
				'github_token': githubToken
			}),
			headers: getHeaders()
		}).then(responseHandler);

		const token = (await response.json<AuthenticateResponse>()).access_token;
		this.token = token;
		return token;
	}

	/**
	 * Create a temporary authorization for GitHub to use with Travis
	 */
	async createAuthorization(repo: GitHub) {
		const params = {
			note: 'temporary token for travis cli',
			scopes: [
				'read:org', 'user:email', 'repo_deployment', 'repo:status', 'public_repo', 'write:repo_hook'
			]
		};
		const existing = await repo.findAuthorization(params);

		if (existing) {
			throw new Error(`An existing authorization exists. "#${ existing.id }"`);
		}

		this.githubAuthorization = await repo.createAuthorization(params);
		try {
			await this.authenticate(this.githubAuthorization.token);
		}
		catch (e) {
			logger.info('Cleaning up temporary GitHub token');
			await this.deleteAuthorization(repo);
			throw e;
		}
	}

	/**
	 * delete authorization used by the GitHub repo
	 */
	async deleteAuthorization(repo: GitHub) {
		if (this.githubAuthorization) {
			await repo.deleteAuthorization(this.githubAuthorization.id);
		}
	}

	async fetchRepository(slug: string) {
		const endpoint = `https://api.travis-ci.org/repos/${ slug }`;
		const response = await request.get(endpoint, {
			headers: getHeaders(this.token)
		}).then(responseHandler);

		const body = await response.json<FetchRepositoryResponse>();
		return new Repository(this.token, body.repo);
	}

	/**
	 * @return if Travis has been authorized through GitHub
	 */
	isAuthorized() {
		return !!this.githubAuthorization;
	}
}

export interface RepositoryData {
	active: boolean;
	id: number;
	slug: string;
}

export interface EnvironmentVariable {
	id: string;
	name: string;
	value: string;
	'public': boolean;
	repository_id: number;
}

export interface ListEnvironmentVariablesResponse {
	env_vars: EnvironmentVariable[];
}

export class Repository {
	active: boolean;

	id: number;

	slug: string;

	token: string;

	constructor(token: string, repo: RepositoryData) {
		this.active = !!repo.active;
		this.id = repo.id;
		this.slug = repo.slug;
		this.token = token;
	}

	async listEnvironmentVariables(): Promise<EnvironmentVariable[]> {
		const endpoint = `https://api.travis-ci.org/settings/env_vars?repository_id=${ this.id }`;
		const response = await request.get(endpoint, {
			headers: getHeaders(this.token)
		}).then(responseHandler);

		return (await response.json<ListEnvironmentVariablesResponse>()).env_vars;
	}

	async setEnvironmentVariables(... variables: Array<{ name: string, value: string, isPublic?: boolean }>) {
		const envvars = await this.listEnvironmentVariables();

		for (let { name, value, isPublic } of variables) {
			const match: EnvironmentVariable = (<any> envvars).find(function (envvar: EnvironmentVariable) {
				return envvar.name === name;
			});

			if (match) {
				await this.updateEnvironmentVariable(match.id, name, value, isPublic);
			}
			else {
				await this.addEnvironmentVariable(name, value, isPublic);
			}
		}
	}

	private async addEnvironmentVariable(name: string, value: string, isPublic = false): Promise<Repository> {
		const endpoint = `https://api.travis-ci.org/settings/env_vars?repository_id=${ this.id }`;
		const response = await request.post(endpoint, {
			body: JSON.stringify({
				'env_var': {
					name,
					value,
					'public': isPublic
				}
			}),
			headers: getHeaders(this.token)
		}).then(responseHandler);

		return response.json<Repository>();
	}

	private async updateEnvironmentVariable(id: string, name: string, value: string, isPublic = false): Promise<Repository> {
		const endpoint = `https://api.travis-ci.org/settings/env_vars/${ id }?repository_id=${ this.id }`;
		const response = await request(endpoint, {
			body: JSON.stringify({
				'env_var': {
					name,
					value,
					'public': isPublic
				}
			}),
			headers: getHeaders(this.token),
			method: 'patch'
		}).then(responseHandler);

		return response.json<Repository>();
	}
}
