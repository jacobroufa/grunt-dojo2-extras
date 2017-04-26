import request, { responseHandler } from './request';
import { hasGitCredentials } from './environment';
import { readFileSync } from 'fs';
import { Response } from '@dojo/core/request';
import { RequestOptions } from '@dojo/core/request/interfaces';

export interface Release {
	name: string;
	commit: {
		sha: string;
		url: string;
	};
}

const API_URL = 'https://api.github.com';

export interface Options {
	password?: string;
	username?: string;
}

export interface AuthResponse {
	id: number;
	token: string;
}

export default class GitHub {
	name: string;

	owner: string;

	password: string;

	username: string;

	constructor(owner: string, name: string, options: Options = {}) {
		if (!owner) {
			throw new Error('A repo owner must be specified');
		}
		if (!name) {
			throw new Error('A repo name must be specified');
		}

		this.owner = owner;
		this.name = name;
		this.authenticate(options.username, options.password);
	}

	get url(): string {
		return hasGitCredentials() ? this.getSshUrl() : this.getHttpsUrl();
	}

	async createAuthorizationToken(note: string = '', scopes: string[] = [
		'read:org', 'user:email', 'repo_deployment', 'repo:status', 'public_repo', 'write:repo_hook'
	]): Promise<AuthResponse> {
		this.assertAuthentication();
		const endpoint = `https://api.github.com/authorizations`;
		const options: RequestOptions = {
			body: JSON.stringify({
				scopes,
				note
			}),
			password: this.password,
			user: this.username
		};
		return request.post(endpoint, options)
			.then(responseHandler)
			.then(response => response.json<AuthResponse>());
	}

	async removeAuthorizationToken(id: string | number): Promise<Response> {
		const endpoint = `https://api.github.com/authorizations/${ id }`;
		return request.delete(endpoint, {
			password: this.password,
			user: this.username
		}).then(responseHandler);
	}

	addDeployKey(keyfile: string, title: string, readOnly: boolean = true): Promise<any> {
		this.assertAuthentication();
		const endpoint = `https://api.github.com/repos/${ this.owner }/${ this.name }/keys`;
		const key = readFileSync(keyfile, { encoding: 'utf8' });
		return request.post(endpoint, {
			body: JSON.stringify({
				title,
				key,
				read_only: readOnly
			}),
			password: this.password,
			user: this.username
		}).then(responseHandler)
		.then(response => response.json());
	}

	authenticate(username: string, password: string) {
		this.username = username;
		this.password = password;
	}

	/**
	 * @return {Promise<Release[]>} a list of releases
	 */
	fetchReleases(): Promise<Release[]> {
		const url = `${ API_URL }/repos/${ this.owner }/${ this.name }/tags`;

		return request(url)
			.then(responseHandler)
			.then(response => response.json<Release[]>());
	}

	getHttpsUrl() {
		return `https://github.com/${ this.owner }/${ this.name }.git`;
	}

	getSshUrl() {
		return `git@github.com:${ this.owner }/${ this.name }.git`;
	}

	toString() {
		return `${ this.owner }/${ this.name }`;
	}

	private assertAuthentication() {
		if (!this.username) {
			throw new Error('Username must be provided');
		}
		if (!this.password) {
			throw new Error('Password must be provided');
		}
	}
}
