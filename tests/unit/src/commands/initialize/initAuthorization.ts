import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../../_support/loadModule';
import { spy, stub, SinonSpy, SinonStub } from 'sinon';

let initAuthorization: any;
let Travis: any;
let GitHub: any;
let TravisSpy: SinonSpy;
let GitHubSpy: SinonSpy;
let isAuthorizedStub: SinonStub;
let travisCreateAuthorizationStub: SinonStub;
let travisDeleteAuthorizationStub: SinonStub;
let listEnvironmentVariablesStub: SinonStub;
let setEnvironmentVariablesStub: SinonStub;
let fetchRepositoryStub: SinonStub;
let authenticateStub: SinonStub;
let getRateLimitStub: SinonStub;
let toStringStub: SinonStub;
let repoCreateAuthorizationStub: SinonStub;
let repoDeleteAuthorizationStub: SinonStub;
let findStub: SinonStub;
let githubAuthStub: SinonStub;

registerSuite({
	name: 'commands/initialize/initAuthorization',

	before() {
		isAuthorizedStub = stub();
		travisCreateAuthorizationStub = stub().returns(Promise.resolve());
		travisDeleteAuthorizationStub = stub().returns(Promise.resolve());
		listEnvironmentVariablesStub = stub().returns(Promise.resolve([]));
		setEnvironmentVariablesStub = stub().returns(Promise.resolve());
		fetchRepositoryStub = stub().returns(Promise.resolve({
			listEnvironmentVariables: listEnvironmentVariablesStub,
			setEnvironmentVariables: setEnvironmentVariablesStub
		}));
		authenticateStub = stub();
		getRateLimitStub = stub().returns(Promise.resolve());
		toStringStub = stub();
		repoCreateAuthorizationStub = stub().returns(Promise.resolve({
			token: 'token'
		}));
		repoDeleteAuthorizationStub = stub().returns(Promise.resolve());
		findStub = stub();
		githubAuthStub = stub();

		Travis = class {
			constructor() {}
			isAuthorized: SinonStub = isAuthorizedStub;
			createAuthorization: SinonStub = travisCreateAuthorizationStub;
			deleteAuthorization: SinonStub = travisDeleteAuthorizationStub;
			fetchRepository: SinonStub = fetchRepositoryStub;
		};

		GitHub = class {
			constructor() {}
			owner = 'dojo';
			name = 'grunt-dojo2-extras';
			api: any = {
				authenticate: authenticateStub,
				misc: {
					getRateLimit: getRateLimitStub
				}
			};
			toString: SinonStub = toStringStub;
			createAuthorization = repoCreateAuthorizationStub;
			deleteAuthorization = repoDeleteAuthorizationStub;
		};

		TravisSpy = spy(Travis);
		GitHubSpy = spy(GitHub);
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		initAuthorization = loadModule('src/commands/initialize/initAuthorization', {
			'../../util/Travis': { default: TravisSpy },
			'../../util/GitHub': { default: GitHubSpy },
			'@dojo/shim/array': {
				find: findStub
			},
			'../../util/environment': {
				env: {
					githubAuth: githubAuthStub
				}
			}
		});
	},

	afterEach() {
		TravisSpy.reset();
		GitHubSpy.reset();
		isAuthorizedStub.reset();
		travisCreateAuthorizationStub.reset();
		travisDeleteAuthorizationStub.reset();
		listEnvironmentVariablesStub = stub();
		setEnvironmentVariablesStub = stub();
		fetchRepositoryStub.reset();
		authenticateStub.reset();
		getRateLimitStub.reset();
		toStringStub.reset();
		repoCreateAuthorizationStub.reset();
		repoDeleteAuthorizationStub.reset();
		findStub.reset();
		githubAuthStub.reset();
	},

	'initAuthorization': (() => {
		return {
			async 'explicit Travis instance'() {
				const travis = new Travis();

				await assertInitAuthorization(travis);
			},

			async 'Travis is not authorized'() {
				isAuthorizedStub.returns(false);

				await assertInitAuthorization();

				assert.isTrue(travisCreateAuthorizationStub.calledOnce);
			},

			async 'fetch repo and environment, create authorization'() {
				await assertInitAuthorization();

				assert.isTrue(fetchRepositoryStub.calledOnce);
				assert.isTrue(listEnvironmentVariablesStub.calledOnce);
				assert.isTrue(findStub.calledOnce);
				assert.isTrue(repoCreateAuthorizationStub.calledOnce);
				assert.isTrue(setEnvironmentVariablesStub.calledOnce);
			},

			async 'eventually throws'() {
				fetchRepositoryStub.returns(Promise.reject(new Error('error')));

				try {
					await assertInitAuthorization();

					assert.fail();
				} catch (e) {
					assert.strictEqual(e.message, 'error');
				}
			},

			async 'delete repo authorization'() {
				repoCreateAuthorizationStub.returns(Promise.resolve(true));
				setEnvironmentVariablesStub.returns(Promise.reject(new Error('error')));

				try {
					await assertInitAuthorization();
				} catch (e) {
					assert.isTrue(repoDeleteAuthorizationStub.calledOnce);
				}
			}
		};

		async function assertInitAuthorization(travis?: any) {
			const repo = new GitHub();

			await initAuthorization(repo, travis);

			if (!travis) {
				assert.isTrue(TravisSpy.calledOnce);
			}

			assert.isTrue(isAuthorizedStub.calledOnce);
			assert.isTrue(travisDeleteAuthorizationStub.calledOnce);
		}
	})()
});
