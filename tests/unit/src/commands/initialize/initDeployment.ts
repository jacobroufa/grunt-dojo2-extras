import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../../_support/loadModule';
import { spy, stub, SinonSpy, SinonStub } from 'sinon';

let initDeployment: any;
let Travis: any;
let GitHub: any;
let TravisSpy: SinonSpy;
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
let listEnvironmentVariablesStub: SinonStub;
let setEnvironmentVariablesStub: SinonStub;
let createKeyStub: SinonStub;
let deleteKeyStub: SinonStub;

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
		listEnvironmentVariablesStub = stub();
		setEnvironmentVariablesStub = stub();
		createKeyStub = stub();
		deleteKeyStub = stub();

		Travis = class {
			constructor() {}
			isAuthorized: SinonStub = isAuthorizedStub;
			createAuthorization: SinonStub = travisCreateAuthorizationStub;
			deleteAuthorization: SinonStub = travisDeleteAuthorizationStub;
			fetchRepository: SinonStub = fetchRepositoryStub;
		};

		GitHub = class {
			constructor() {}
			toString() {
				return 'repo';
			}
			createKey: SinonStub = createKeyStub;
			deleteKey: SinonStub = deleteKeyStub;
		};

		TravisSpy = spy(Travis);
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		isAuthorizedStub.returns(true);
		keyFileStub.returns('keyFile');
		encryptedKeyFileStub.returns('encryptedKeyFile');
		existsSyncStub.returns(true);
		fetchRepositoryStub.returns(Promise.resolve({
			listEnvironmentVariables: listEnvironmentVariablesStub,
			setEnvironmentVariables: setEnvironmentVariablesStub
		}));
		listEnvironmentVariablesStub.returns(Promise.resolve([
			{ name: 'decryptKey', value: 'decryptKey', isPublic: false },
			{ name: 'decryptIv', value: 'decryptIv', isPublic: false }
		]));
		createDeployKeyStub.returns({
			publicKey: 'publicKey',
			privateKey: 'privateKey',
			encryptedKey: {
				key: 'encryptedKey',
				iv: 'encryptedIv'
			}
		});

		initDeployment = loadModule('src/commands/initialize/initDeployment', {
			'../../util/Travis': { default: TravisSpy },
			'../../util/environment': {
				decryptKeyName: 'decryptKey',
				decryptIvName: 'decryptIv',
				githubAuth: githubAuthStub,
				keyFile: keyFileStub,
				encryptedKeyFile: encryptedKeyFileStub
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
		listEnvironmentVariablesStub.reset();
		setEnvironmentVariablesStub.reset();
		createKeyStub.reset();
		deleteKeyStub.reset();
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

			async 'default instance and options; Travis is not authorized, should not create deploy key'() {
				isAuthorizedStub.returns(false);
				travisCreateAuthorizationStub.returns(Promise.resolve());

				await assertInitDeployment();

				assert.isTrue(TravisSpy.calledOnce);
				assert.isTrue(keyFileStub.calledOnce);
				assert.isTrue(encryptedKeyFileStub.calledOnce);
				assert.isTrue(existsSyncStub.calledOnce);

				assert.isTrue(createDeployKeyStub.notCalled);
				assert.isTrue(createKeyStub.notCalled);
				assert.isTrue(setEnvironmentVariablesStub.notCalled);

				assert.isTrue(travisCreateAuthorizationStub.calledOnce);
				assert.isTrue(findStub.calledOnce);
			},

			async 'should create deploy key'() {
				listEnvironmentVariablesStub.returns(Promise.resolve([]));
				isAuthorizedStub.returns(false);
				existsSyncStub.returns(false);

				await assertInitDeployment();

				assert.isTrue(createDeployKeyStub.calledOnce);
				assert.isTrue(readFileSyncStub.calledOnce);
				assert.isTrue(createKeyStub.calledOnce);
				assert.isTrue(setEnvironmentVariablesStub.calledOnce);
			},

			async 'has no key; eventually throws'() {
				const errorMessage = 'error: cannot create key';

				createKeyStub.returns(Promise.reject(errorMessage));

				try {
					await assertInitDeployment();
				} catch (e) {
					assert.isTrue(deleteKeyStub.calledOnce);
					assert.strictEqual(errorMessage, e.message);
				}
			},

			async 'has deploy key; eventually throws'() {
				const errorMessage = 'error: cannot set env vars';

				setEnvironmentVariablesStub.returns(Promise.reject(errorMessage));

				try {
					await assertInitDeployment();
				} catch (e) {
					assert.isTrue(deleteKeyStub.notCalled);
					assert.strictEqual(errorMessage, e.message);
				}
			}
		};

		async function assertInitDeployment(travis?: any, options?: any) {
			const repo = new GitHub();

			await initDeployment(repo, travis, options);

			assert.isTrue(isAuthorizedStub.calledOnce);
			assert.isTrue(fetchRepositoryStub.calledOnce);
			assert.isTrue(travisDeleteAuthorizationStub.calledOnce);
		}
	})()
});
