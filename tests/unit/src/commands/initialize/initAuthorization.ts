import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../../_support/loadModule';
import { spy, stub, SinonStub } from 'sinon';
import { throwWithError } from '../../../../_support/util';

let initAuthorization: any;

const isAuthorizedStub = stub();
const travisCreateAuthorizationStub = stub();
const travisDeleteAuthorizationStub = stub();
const listEnvironmentVariablesStub = stub();
const setEnvironmentVariablesStub = stub();
const fetchRepositoryStub = stub();
const authenticateStub = stub();
const getRateLimitStub = stub();
const toStringStub = stub();
const repoCreateAuthorizationStub = stub();
const repoDeleteAuthorizationStub = stub();
const findStub = stub();
const githubAuthStub = stub();

const Travis = class {
	constructor() {}
	isAuthorized: SinonStub = isAuthorizedStub;
	createAuthorization: SinonStub = travisCreateAuthorizationStub;
	deleteAuthorization: SinonStub = travisDeleteAuthorizationStub;
	fetchRepository: SinonStub = fetchRepositoryStub;
};

const GitHub = class {
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

const TravisSpy = spy(Travis);
const GitHubSpy = spy(GitHub);

registerSuite({
	name: 'commands/initialize/initAuthorization',

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		travisCreateAuthorizationStub.returns(Promise.resolve());
		travisDeleteAuthorizationStub.returns(Promise.resolve());
		fetchRepositoryStub.returns(Promise.resolve({
			listEnvironmentVariables: listEnvironmentVariablesStub.returns(Promise.resolve([])),
			setEnvironmentVariables: setEnvironmentVariablesStub.returns(Promise.resolve())
		}));
		getRateLimitStub.returns(Promise.resolve());
		repoCreateAuthorizationStub.returns(Promise.resolve({
			token: 'token'
		}));
		repoDeleteAuthorizationStub.returns(Promise.resolve());

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
		listEnvironmentVariablesStub.reset();
		setEnvironmentVariablesStub.reset();
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

			'eventually throws'() {
				fetchRepositoryStub.returns(Promise.reject(new Error('error')));

				const promise = assertInitAuthorization();

				return promise.then(
					throwWithError('Should reject when fetching repository stub fails'),
					(e) => {
						assert.strictEqual(e.message, 'error');
					}
				);
			},

			'delete repo authorization'() {
				repoCreateAuthorizationStub.returns(Promise.resolve(true));
				setEnvironmentVariablesStub.returns(Promise.reject(new Error('error')));

				const promise = assertInitAuthorization();

				return promise.then(
					throwWithError('Should reject when setting environment variables fails'),
					() => {
						assert.isTrue(repoDeleteAuthorizationStub.calledOnce);
					}
				);
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
