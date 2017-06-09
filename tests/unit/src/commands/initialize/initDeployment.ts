import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../../_support/loadModule';
import { spy, stub, SinonStub } from 'sinon';
import { throwWithError } from '../../../../_support/util';

let initDeployment: any;

const githubAuthStub = stub();
const keyFileStub = stub();
const encryptedKeyFileStub = stub();
const createDeployKeyStub = stub();
const findStub = stub();
const existsSyncStub = stub();
const readFileSyncStub = stub();
const isAuthorizedStub = stub();
const travisCreateAuthorizationStub = stub();
const travisDeleteAuthorizationStub = stub();
const fetchRepositoryStub = stub();
const listEnvironmentVariablesStub = stub();
const setEnvironmentVariablesStub = stub();
const createKeyStub = stub();
const deleteKeyStub = stub();

const Travis = class {
	constructor() {}
	isAuthorized: SinonStub = isAuthorizedStub;
	createAuthorization: SinonStub = travisCreateAuthorizationStub;
	deleteAuthorization: SinonStub = travisDeleteAuthorizationStub;
	fetchRepository: SinonStub = fetchRepositoryStub;
};

const GitHub = class {
	constructor() {}
	toString() {
		return 'repo';
	}
	createKey: SinonStub = createKeyStub;
	deleteKey: SinonStub = deleteKeyStub;
};

const TravisSpy = spy(Travis);

registerSuite({
	name: 'commands/initialize/initDeployment',

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		isAuthorizedStub.returns(true);
		keyFileStub.returns('keyFile');
		encryptedKeyFileStub.returns('encryptedKeyFile');
		existsSyncStub.returns(true);
		fetchRepositoryStub.resolves({
			listEnvironmentVariables: listEnvironmentVariablesStub,
			setEnvironmentVariables: setEnvironmentVariablesStub
		});
		listEnvironmentVariablesStub.resolves([
			{ name: 'decryptKey', value: 'decryptKey', isPublic: false },
			{ name: 'decryptIv', value: 'decryptIv', isPublic: false }
		]);
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
		async function assertInitDeployment(travis?: any, options?: any) {
			const repo = new GitHub();
			const promise = await initDeployment(repo, travis, options);

			assert.isTrue(isAuthorizedStub.calledOnce);
			assert.isTrue(fetchRepositoryStub.calledOnce);
			assert.isTrue(travisDeleteAuthorizationStub.calledOnce);

			return promise;
		}

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
				travisCreateAuthorizationStub.resolves();

				await assertInitDeployment();

				// default options
				assert.isTrue(TravisSpy.calledOnce);
				assert.isTrue(keyFileStub.calledOnce);
				assert.isTrue(encryptedKeyFileStub.calledOnce);

				// because travis is not authorized, we should create an authorization
				assert.isTrue(travisCreateAuthorizationStub.calledOnce);

				// we should get the Travis environment variables
				assert.isTrue(listEnvironmentVariablesStub.calledOnce);

				// existsSync is called within the private function `shouldCreateDeployKey`
				assert.isTrue(existsSyncStub.calledOnce);

				// we shouldn't be creating a deploy key, so these stubs should not be called
				assert.isTrue(createDeployKeyStub.notCalled);
				assert.isTrue(createKeyStub.notCalled);
				assert.isTrue(setEnvironmentVariablesStub.notCalled);

				// find is called within the private function `displayDeployOptionSummary`
				assert.isTrue(findStub.calledOnce);
			},

			async 'should create deploy key'() {
				listEnvironmentVariablesStub.resolves([]);
				isAuthorizedStub.returns(false);
				existsSyncStub.returns(false);

				await assertInitDeployment();

				assert.isTrue(createDeployKeyStub.calledOnce);
				assert.isTrue(readFileSyncStub.calledOnce);
				assert.isTrue(createKeyStub.calledOnce);
				assert.isTrue(setEnvironmentVariablesStub.calledOnce);
			},

			'has no ssh key so will not call `deleteKey`; eventually throws'() {
				const message = 'error: cannot create key';

				createKeyStub.rejects({ message });
				existsSyncStub.returns(false);
				listEnvironmentVariablesStub.resolves([]);

				return assertInitDeployment().then(
					throwWithError('Should throw when no ssh key can be created'),
					(e) => {
						assert.isTrue(deleteKeyStub.notCalled);
						assert.strictEqual(message, e.message);
					}
				);
			},

			'has deploy key environment variable; calls `deleteKey`; eventually throws'() {
				const message = 'error: cannot set env vars';

				setEnvironmentVariablesStub.rejects({ message });
				existsSyncStub.returns(false);
				listEnvironmentVariablesStub.resolves([]);
				// Won't delete key unless keyResponse has a value
				createKeyStub.resolves(true);

				return assertInitDeployment().then(
					throwWithError('Should throw when environment variables cannot be set'),
					(e) => {
						assert.isTrue(deleteKeyStub.calledOnce);
						assert.strictEqual(message, e.message);
					}
				);
			}
		};
	})()
});
