import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../../_support/loadModule';
import { spy, stub, SinonSpy, SinonStub } from 'sinon';

let initDeployment: any;
let Travis: any;
let GitHub: any;
let TravisSpy: SinonSpy;
let GitHubSpy: SinonSpy;
let githubAuthStub: SinonStub;
let keyFileStub: SinonStub;
let encryptedKeyFileStub: SinonStub;
let createDeployKeyStub: SinonStub;
let findStub: SinonStub;
let existsSyncStub: SinonStub;
let readFileSyncStub: SinonStub;
let isAuthorizedStub: SinonStub;
let travisCreateAuthorizationStub: SinonStub;
let travisDeleteAuthorizationStub: SinonStub;
let fetchRepositoryStub: SinonStub;

registerSuite({
	name: 'commands/initialize/initDeployment',

	before() {
		githubAuthStub = stub();
		keyFileStub = stub();
		encryptedKeyFileStub = stub();
		createDeployKeyStub = stub();
		findStub = stub();
		existsSyncStub = stub();
		readFileSyncStub = stub();
		isAuthorizedStub = stub();
		travisCreateAuthorizationStub = stub();
		travisDeleteAuthorizationStub = stub();
		fetchRepositoryStub = stub();

		Travis = class {
			constructor() {}
			isAuthorized: SinonStub = isAuthorizedStub;
			createAuthorization: SinonStub = travisCreateAuthorizationStub;
			deleteAuthorization: SinonStub = travisDeleteAuthorizationStub;
			fetchRepository: SinonStub = fetchRepositoryStub;
		};

		GitHub = class {
			constructor() {}
		};

		TravisSpy = spy(Travis);
		GitHubSpy = spy(GitHub);
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		initDeployment = loadModule('src/commands/initialize/initDeployment', {
			'../../util/Travis': { default: TravisSpy },
			'../../util/GitHub': { default: GitHubSpy },
			'../../util/environment': {
				env: {
					githubAuth: githubAuthStub,
					keyFile: keyFileStub,
					encryptedKeyFile: encryptedKeyFileStub
				}
			},
			'./createDeployKey': { default: createDeployKeyStub },
			'@dojo/shim/array': {
				find: findStub
			},
			'fs': {
				existsSync: existsSyncStub,
				readFileSync: readFileSyncStub
			}
		});
	},

	afterEach() {
		TravisSpy.reset();
		GitHubSpy.reset();
		githubAuthStub.reset();
		keyFileStub.reset();
		encryptedKeyFileStub.reset();
		createDeployKeyStub.reset();
		findStub.reset();
		existsSyncStub.reset();
		readFileSyncStub.reset();
		isAuthorizedStub.reset();
		travisCreateAuthorizationStub.reset();
		travisDeleteAuthorizationStub.reset();
		fetchRepositoryStub.reset();
	},

	'initDeployment': (() => {
		return {
			async 'explicit Travis instance and options'() {
				const travis = new Travis();

				await assertInitDeployment(travis, {
					deployKeyFile: 'deploy-key.file',
					encryptedKeyFile: 'deploy-key.enc'
				});
			},

			async 'Travis is not authorized'() {
				isAuthorizedStub.returns(false);

				await assertInitDeployment();

				assert.isTrue(travisCreateAuthorizationStub.calledOnce);
			},

			async 'fetch repo and environment, create authorization'() {
			},

			async 'eventually throws'() {
			},

			async 'delete repo authorization'() {
			}
		};

		async function assertInitDeployment(travis?: any, options?: any) {
			const repo = new GitHub();

			await initDeployment(repo, travis, options);

			assert.isTrue(TravisSpy.calledOnce);
			assert.isTrue(isAuthorizedStub.calledOnce);
			assert.isTrue(travisDeleteAuthorizationStub.calledOnce);
		}
	})()
});
