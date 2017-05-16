import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { stub, SinonStub } from 'sinon';

let decryptDeployKey: any;
let decryptDataObj: any;
let decryptDataStub: SinonStub;
let encryptedKeyFileStub: SinonStub;
let keyFileStub: SinonStub;
let existsSyncStub: SinonStub;
let createWriteStreamStub: SinonStub;
let createReadStreamStub: SinonStub;

registerSuite({
	name: 'commands/decryptDeployKey',

	before() {
		decryptDataObj = {
			on: stub(),
			pipe: stub()
		};
		decryptDataStub = stub();
		encryptedKeyFileStub = stub();
		keyFileStub = stub();
		existsSyncStub = stub();
		createWriteStreamStub = stub();
		createReadStreamStub = stub();
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		decryptDataObj.on.returns(decryptDataObj);
		decryptDataObj.pipe.returns(decryptDataObj);

		decryptDeployKey = loadModule('src/commands/decryptDeployKey', {
			'../util/crypto': {
				decryptData: decryptDataStub.returns(decryptDataObj)
			},
			'../util/environment': {
				decryptKeyName: 'decryptKeyName',
				decryptIvName: 'decryptIvName',
				encryptedKeyFile: encryptedKeyFileStub.returns('encryptedKeyFile'),
				keyFile: keyFileStub.returns('keyFile')
			},
			'fs': {
				existsSync: existsSyncStub,
				createWriteStream: createWriteStreamStub.returns('writeStream'),
				createReadStream: createReadStreamStub.returns('readStream')
			}
		});
	},

	afterEach() {
		decryptDataStub.reset();
		encryptedKeyFileStub.reset();
		keyFileStub.reset();
		existsSyncStub.reset();
		createWriteStreamStub.reset();
		createReadStreamStub.reset();
		decryptDataObj.on.reset();
		decryptDataObj.pipe.reset();
	},

	'decryptDeployKey': (() => {
		return {
			async 'arguments passed in explicitly'() {
				ensureDecryptionResolves();

				const deployKeyDecrypted = await assertDecryptDeployKey('encrypted.file', 'decrypt key', 'decrypt iv', 'decrypted.file');

				assert.isTrue(deployKeyDecrypted);

				assert.isTrue(encryptedKeyFileStub.notCalled);
				assert.isTrue(keyFileStub.notCalled);

				assert.isTrue(createReadStreamStub.calledOnce);
				assert.isTrue(createWriteStreamStub.calledOnce);
				assert.isTrue(decryptDataStub.calledOnce);
				assert.isTrue(decryptDataStub.calledWith('readStream', 'decrypt key', 'decrypt iv'));
			},

			async 'arguments obtained from default'() {
				ensureDecryptionResolves();

				const deployKeyDecrypted = await assertDecryptDeployKey();

				assert.isTrue(deployKeyDecrypted);
				assert.isTrue(existsSyncStub.calledTwice);
			},

			async 'nonexistent files and falsy arguments; eventually returns false'() {
				existsSyncStub.returns(false);

				assert.isFalse(await assertDecryptDeployKey());
			},

			async 'decryption eventually rejects'() {
				existsSyncStub.onCall(0).returns(true);
				existsSyncStub.onCall(1).returns(false);
				decryptDataObj.on.withArgs('error').yields(new Error('error'));

				try {
					await assertDecryptDeployKey();

					assert.fail();
				} catch (err) {
					assert.strictEqual(err.message, 'error');
				}
			}
		};

		function ensureDecryptionResolves() {
			existsSyncStub.onCall(0).returns(true);
			existsSyncStub.onCall(1).returns(false);
			decryptDataObj.on.withArgs('close').yields();
		}

		async function assertDecryptDeployKey(encryptedFile?: any, key?: any, iv?: any, decryptedFile?: any) {
			process.env.decryptKeyName = 'decryptKeyName';
			process.env.decryptIvName = 'decryptIvName';

			const promise = decryptDeployKey(encryptedFile, key, iv, decryptedFile);

			assert.instanceOf(promise, Promise);

			return promise;
		}
	})()
});
