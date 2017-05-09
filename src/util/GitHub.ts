import { githubAuth, hasGitCredentials } from './environment';
import * as GitHubApi from 'github';
import { AuthorizationCreateParams } from 'github';

export interface Release {
	name: string;
	commit: {
		sha: string;
		url: string;
	};
}

export interface AuthResponse {
	id: number;
	token: string;
	note: string;
	fingerprint: string;
}

/**
 * GitHub OAuth scopes define permissions granted to a specific token
 */
export type OAuthScope = 'user' | 'user:email' | 'user:follow' | 'public_repo' | 'repo' | 'repo_deployment' |
	'repo:status' | 'delete_repo' | 'notifications' | 'gist' | 'read:repo_hook' | 'write:repo_hook' |
	'admin:repo_hook' | 'admin:org_hook' | 'read:org' | 'write:org' | 'admin:org' | 'read:public_key' |
	'write:public_key' | 'admin:public_key' | 'read:gpg_key' | 'write:gpg_key' | 'admin:gpg_key';

export default class GitHub {
	name: string;

	owner: string;

	readonly _api: GitHubApi;

	private authed = false;

	constructor(owner: string, name: string) {
		if (!owner) {
			throw new Error('A repo owner must be specified');
		}
		if (!name) {
			throw new Error('A repo name must be specified');
		}

		this._api = new GitHubApi({
			headers: {
				'user-agent': 'grunt-dojo2-extras'
			},
			Promise
		});

		this.owner = owner;
		this.name = name;
	}

	get api(): GitHubApi {
		this.isApiAuthenticated();
		return this._api;
	}

	get url(): string {
		return hasGitCredentials() ? this.getSshUrl() : this.getHttpsUrl();
	}

	async createAuthorization(params: AuthorizationCreateParams): Promise<AuthResponse> {
		const response = await this.api.authorization.create(params);
		return response.data;
	}

	async createKey(key: string): Promise<any> {
		const reponse = await this.api.repos.createKey({
			key,
			owner: this.owner,
			read_only: false,
			repo: this.name,
			title: 'Auto-created Travis Deploy Key'
		});
		return reponse.data;
	}

	async deleteAuthorization(id: string | number) {
		return this.api.authorization.delete({
			id: String(id)
		});
	}

	async deleteKey(id: string | number) {
		return this.api.repos.deleteKey({
			id: String(id),
			owner: this.owner,
			repo: this.name
		});
	}

	async fetchReleases(): Promise<Release[]> {
		const response = await this.api.repos.getReleases({
			owner: this.owner,
			repo: this.name
		});
		return response.data;
	}

	/**
	 * Find an authorization that matches the supplied params.
	 * NOTE: the token value will be unavailable and is only available on creation
	 * @param params search params to match for the authorization
	 */
	async findAuthorization(params: AuthorizationCreateParams): Promise<AuthResponse> {
		const response = await this.api.authorization.getAll({
			page: 1
		});
		const auths: AuthResponse[] = response.data || [];
		return auths.filter(function (auth: AuthResponse) {
			for (const name in params) {
				const expected = (<any> params)[name];
				const actual = (<any> auth)[name];
				if (Array.isArray(expected)) {
					if (!Array.isArray(actual)) {
						return false;
					}
					for (const value of expected) {
						if (actual.indexOf(value) === -1) {
							return false;
						}
					}
				}
				else if (expected !== actual) {
					return false;
				}
			}

			return true;
		})[0];
	}

	/**
	 * Report if the API has been authenticated with an OAuth token. API calls that have not been authenticated are
	 * subject to stricter rate-limits
	 * @return if the API has an OAuth token
	 */
	isApiAuthenticated() {
		if (!this.authed) {
			const auth = githubAuth();

			if (auth) {
				this._api.authenticate(auth);
			}
			this.authed = true;
		}
		return !!(<any> this._api).auth;
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
}
