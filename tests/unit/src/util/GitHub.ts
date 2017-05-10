import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { stub, SinonStub } from 'sinon';
import GitHub from 'src/util/GitHub';

let Module: any;
let github: GitHub;
let githubAuthStub: SinonStub;
let hasGitCredentialsStub: SinonStub;
let GitHubApiStub: SinonStub;
let AuthorizationCreateParamsStub: SinonStub;

registerSuite({
	name: 'util/Git',

	before() {
		githubAuthStub = stub();
		hasGitCredentialsStub = stub();
		GitHubApiStub = stub();
		AuthorizationCreateParamsStub = stub();
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		Module = loadModule('src/util/GitHub', {
			'./environment': {
				githubAuth: githubAuthStub,
				hasGitCredentials: hasGitCredentialsStub
			},
			'github': {
				'*': GitHubApiStub,
				AuthorizationCreateParams: AuthorizationCreateParamsStub
			}
		});

		github = new Module();
	},

	afterEach() {
		githubAuthStub.reset();
		hasGitCredentialsStub.reset();
		GitHubApiStub.reset();
		AuthorizationCreateParamsStub.reset();
	},

	'constructor': {
		'without owner; throws Error'() {
		},

		'without name; throws Error'() {
		},

		'properly initialized; _api, owner, and name set'() {
		}
	},

	'get api'() {
	},

	'get url'() {
	},

	async createAuthorization() {
	},

	async createKey() {
	},

	async deleteAuthorization() {
	},

	async deleteKey() {
	},

	async fetchReleases() {
	},

	async findAuthorization() {
	},

	isApiAuthenticated() {
	},

	getHttpsUrl() {
	},

	getSshUrl() {
	},

	toString() {
	}
});
