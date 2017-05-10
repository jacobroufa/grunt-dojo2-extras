import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { spy, stub, SinonSpy, SinonStub } from 'sinon';
import GitHub from 'src/util/GitHub';

let Module: any;
let github: GitHub;
let githubAuthStub: SinonStub;
let hasGitCredentialsStub: SinonStub;
let GitHubApiSpy: SinonSpy;

registerSuite({
	name: 'util/GitHub',

	before() {
		const GitHubApi = class {
			authenticate: SinonStub = stub();
			authorization = {
				create: stub(),
				delete: stub(),
				getAll: stub()
			};
			AuthorizationCreateParams: SinonStub = stub();
			repos = {
				createKey: stub(),
				deleteKey: stub(),
				getReleases: stub()
			};
		};

		githubAuthStub = stub();
		hasGitCredentialsStub = stub();
		GitHubApiSpy = spy(GitHubApi);
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
			'github': GitHubApiSpy
		});

		github = new Module('dojo', 'grunt-dojo2-extras');
	},

	afterEach() {
		githubAuthStub.reset();
		hasGitCredentialsStub.reset();
		GitHubApiSpy.reset();
	},

	'constructor': {
		'without owner; throws Error'() {
			try {
				new Module();
			} catch (e) {
				assert.equal(e.message, 'A repo owner must be specified');
			}
		},

		'without name; throws Error'() {
			try {
				new Module('dojo');
			} catch (e) {
				assert.equal(e.message, 'A repo name must be specified');
			}
		},

		'properly initialized; _api, owner, and name set'() {
			assert.isTrue(GitHubApiSpy.calledOnce);
			assert.strictEqual(github.owner, 'dojo');
			assert.strictEqual(github.name, 'grunt-dojo2-extras');
		}
	},

	'get api'() {
		github.isApiAuthenticated = stub();

		const api = github.api;

		assert.strictEqual(api, github._api);
	},

	'get url': (() => {
		return {
			'has git credentials; returns ssh url'() {
				const getSshUrl = stub(github, 'getSshUrl');

				hasGitCredentialsStub.returns(true);

				assertCredentials();

				assert.isTrue(getSshUrl.calledOnce);

				getSshUrl.reset();
			},

			'doesn\'t have git credentials; returns https url'() {
				const getHttpsUrl = stub(github, 'getHttpsUrl');

				hasGitCredentialsStub.returns(false);

				assertCredentials();

				assert.isTrue(getHttpsUrl.calledOnce);

				getHttpsUrl.reset();
			}
		};

		function assertCredentials() {
			const url = github.url;

			assert.isTrue(hasGitCredentialsStub.calledOnce);

			return url;
		}
	})(),

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
