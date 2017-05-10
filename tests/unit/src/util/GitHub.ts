import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { spy, stub, SinonSpy, SinonStub } from 'sinon';
import GitHub from 'src/util/GitHub';

let Module: any;
let github: GitHub;
let githubAuthStub: SinonStub;
let hasGitCredentialsStub: SinonStub;
let authorizationGetAllStub: SinonStub;
let GitHubApiSpy: SinonSpy;

registerSuite({
	name: 'util/GitHub',

	before() {
		githubAuthStub = stub();
		hasGitCredentialsStub = stub();
		authorizationGetAllStub = stub();

		const GitHubApi = class {
			get auth() {
				return true;
			}
			authenticate: SinonStub = stub();
			authorization = {
				create: stub().returns({ data: 'create' }),
				delete: stub(),
				getAll: authorizationGetAllStub
			};
			repos = {
				createKey: stub().returns({ data: 'createKey' }),
				deleteKey: stub(),
				getReleases: stub().returns({ data: 'getReleases' })
			};
		};

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
		authorizationGetAllStub.reset();
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
		const createAuth = await github.createAuthorization({});

		assert.strictEqual(createAuth, 'create');
	},

	async createKey() {
		const createKey = await github.createKey('key');
		const api = GitHubApiSpy.lastCall.returnValue;

		assert.strictEqual(createKey, 'createKey');
		assert.strictEqual(api.repos.createKey.lastCall.args[0].key, 'key');
	},

	deleteAuthorization: (() => {
		return {
			async 'given numeric id; deleteAuthorization passes it as a string'() {
				const api = await deleteAuthReturnSpy(2);

				assert.strictEqual(api.authorization.delete.lastCall.args[0].id, '2');
			},

			async 'given string id; deleteAuthorization passes it intact'() {
				const api = await deleteAuthReturnSpy('id');

				assert.strictEqual(api.authorization.delete.lastCall.args[0].id, 'id');
			}
		};

		async function deleteAuthReturnSpy(id: string | number) {
			await github.deleteAuthorization(id);

			return GitHubApiSpy.lastCall.returnValue;
		}
	})(),

	deleteKey: (() => {
		return {
			async 'given numeric id; deleteKey passes it as a string'() {
				const api = await deleteKeyReturnSpy(2);

				assert.strictEqual(api.repos.deleteKey.lastCall.args[0].id, '2');
			},

			async 'given string id; deleteKey passes it intact'() {
				const api = await deleteKeyReturnSpy('id');

				assert.strictEqual(api.repos.deleteKey.lastCall.args[0].id, 'id');
			}
		};

		async function deleteKeyReturnSpy(id: string | number) {
			await github.deleteKey(id);

			return GitHubApiSpy.lastCall.returnValue;
		}
	})(),

	async fetchReleases() {
		const fetchReleases = await github.fetchReleases();
		const api = GitHubApiSpy.lastCall.returnValue;

		assert.strictEqual(fetchReleases, 'getReleases');
		assert.isTrue(api.repos.getReleases.calledOnce);
	},

	findAuthorization: (() => {
		const findAuthParams = {
			note: 'temporary token for travis cli',
			scopes: [
				'read:org', 'user:email', 'repo_deployment', 'repo:status', 'public_repo', 'write:repo_hook'
			]
		};
		const scope = { scopes: [ 'read:org' ] };
		const note = { note: 'temporary token for travis cli' };

		return {
			async 'api.authorization.getAll returns no data; returns undefined'() {
				authorizationGetAllStub.returns({});

				const authGetAll = await assertAuthGetAllCalled({});

				assert.isUndefined(authGetAll);
			},

			// 	branch params[name] is array
			// 		branch auth[name] isn't array
			// 		branch auth[name] is array
			// 			member of params[name] exists in auth[name]
			// 	branch params[name] not array
			// 		branch expected === actual
			// 		branch expected !== actual
			'api.authorization.getAll returns array of data': {
				async 'getAll response data contain an array similar to params array member'() {
					authorizationGetAllStub.returns({ data: [ scope ] });

					const AuthGetAll = await assertAuthGetAllCalled(findAuthParams);

					assert.strictEqual(AuthGetAll, scope);
				},

				async 'getAll response data do not contain an array'() {
					authorizationGetAllStub.returns({ data: [ note ] });

					const AuthGetAll = await assertAuthGetAllCalled(note);

					assert.strictEqual(AuthGetAll, note);
				},

				async 'findAuthorization params contain no array'() {
					authorizationGetAllStub.returns({ data: [ note.note ] });

					const AuthGetAll = await assertAuthGetAllCalled(findAuthParams);

					assert.strictEqual(AuthGetAll, note);
				}
			}
		};

		async function assertAuthGetAllCalled(params: any) {
			const findAuth = await github.findAuthorization(params);

			assert.isTrue(authorizationGetAllStub.calledOnce);

			return findAuth;
		}
	})(),

	isApiAuthenticated: {
		'not authenticated; calls githubAuth': {
			'githubAuth returns truthy; calls this._api.authenticate with return value'() {
				const authValue = { user: 'dojo' };

				githubAuthStub.returns(authValue);

				github.isApiAuthenticated();

				const git = GitHubApiSpy.lastCall.returnValue;

				assert.isTrue(git.authenticate.calledOnce);
				assert.isTrue(git.authenticate.calledWith(authValue));
			},

			'githubAuth returns falsy; this._api.authenticate not called'() {
				github.isApiAuthenticated();

				const git = GitHubApiSpy.lastCall.returnValue;

				assert.isTrue(git.authenticate.notCalled);
			}
		},

		'authenticated after first call; subsequent calls simply return API has OAuth token'() {
			let authed = github.isApiAuthenticated();

			assert.isTrue(authed);

			authed = github.isApiAuthenticated();

			assert.isTrue(authed);
			assert.isTrue(githubAuthStub.calledOnce);
		}
	},

	getHttpsUrl() {
		const getHttpsUrl = github.getHttpsUrl();

		assert.strictEqual(getHttpsUrl, 'https://github.com/dojo/grunt-dojo2-extras.git');
	},

	getSshUrl() {
		const getSshUrl = github.getSshUrl();

		assert.strictEqual(getSshUrl, 'git@github.com:dojo/grunt-dojo2-extras.git');
	},

	toString() {
		const toString = github.toString();

		assert.strictEqual(toString, 'dojo/grunt-dojo2-extras');
	}
});
