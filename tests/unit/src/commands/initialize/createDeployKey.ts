import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../../_support/loadModule';
import { stub } from 'sinon';

let createDeployKey: any;

const encryptedStub = {
	pipe: stub(),
	on: stub()
};
const keyFileStub = stub();
const encryptedKeyFileStub = stub();
const existsSyncStub = stub();
const createReadStreamStub = stub();
const createWriteStreamStub = stub();
const createKeyStub = stub();
const encryptDataStub = stub();
const decryptDataStub = stub();
const equalStub = stub();

registerSuite({
	name: 'commands/initialize/createDeployKey',

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		encryptedStub.pipe.returns(encryptedStub);
		encryptedStub.on.returns(encryptedStub).yields();

		createDeployKey = loadModule('src/commands/initialize/createDeployKey', {
			'../../util/environment': {
				keyFile: keyFileStub.returns('keyFileStub'),
				encryptedKeyFile: encryptedKeyFileStub.returns('encryptedKeyFileStub')
			},
			'fs': {
				existsSync: existsSyncStub,
				createReadStream: createReadStreamStub,
				createWriteStream: createWriteStreamStub
			},
			'../../util/crypto': {
				createKey: createKeyStub.returns(Promise.resolve({
					privateKey: 'privateKey',
					publicKey: 'publicKey'
				})),
				encryptData: encryptDataStub.returns({
					key: 'encrypt data key',
					iv: 'encrypt data iv',
					encrypted: encryptedStub
				}),
				decryptData: decryptDataStub
			},
			'../../util/streams': {
				equal: equalStub.returns(Promise.resolve())
			}
		});
	},

	afterEach() {
		keyFileStub.reset();
		encryptedKeyFileStub.reset();
		existsSyncStub.reset();
		createReadStreamStub.reset();
		createWriteStreamStub.reset();
		createKeyStub.reset();
		encryptDataStub.reset();
		decryptDataStub.reset();
		equalStub.reset();
	},

	'createDeployKey': (() => {
		return {
			async 'with explicit arguments passed in'() {
				await assertDeployKey('deploykey.file', 'deploykey.enc');
			},

			async 'with default options'() {
				await assertDeployKey();

				assert.isTrue(keyFileStub.calledOnce);
				assert.isTrue(encryptedKeyFileStub.calledOnce);
			},

			'Deploy key already exists'() {
				existsSyncStub.returns(true);

				const promise = createDeployKey('deploykey.file', 'deploykey.enc');
				return promise.then(assert.fail, (err: any) => {
					assert.strictEqual(err.message, 'Deploy key already exists');
					assert.isTrue(existsSyncStub.calledOnce);
				});

			}
		};

		async function assertDeployKey(deployKeyFile?: any, encryptedKeyFile?: any) {
			const key = await createDeployKey(deployKeyFile, encryptedKeyFile);

			assert.isTrue(createKeyStub.calledOnce);
			assert.isTrue(encryptDataStub.calledOnce);
			assert.isTrue(createReadStreamStub.calledThrice);
			assert.isTrue(createWriteStreamStub.calledOnce);
			assert.isTrue(equalStub.calledOnce);

			return key;
		}
	})()
});
