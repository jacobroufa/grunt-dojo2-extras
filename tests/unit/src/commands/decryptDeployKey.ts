import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { stub } from 'sinon';
import { throwWithError } from '../../../_support/util';

let decryptDeployKey: any;

const decryptDataObj = {
	on: stub(),
	pipe: stub()
};
const decryptDataStub = stub();
const encryptedKeyFileStub = stub();
const keyFileStub = stub();
const existsSyncStub = stub();
const createWriteStreamStub = stub();
const createReadStreamStub = stub();

registerSuite({
	name: 'commands/decryptDeployKey',

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
		function ensureDecryptionResolves() {
			existsSyncStub.onCall(0).returns(true);
			existsSyncStub.onCall(1).returns(false);
			decryptDataObj.on.withArgs('close').yields();
		}

		function assertDecryptDeployKey(encryptedFile?: any, key?: any, iv?: any, decryptedFile?: any) {
			process.env.decryptKeyName = 'decryptKeyName';
			process.env.decryptIvName = 'decryptIvName';

			const promise = decryptDeployKey(encryptedFile, key, iv, decryptedFile);

			assert.instanceOf(promise, Promise);

			return promise;
		}

		return {
			async 'arguments passed in explicitly'() {
				ensureDecryptionResolves();

				const deployKeyDecrypted = await assertDecryptDeployKey('encrypted.file', 'decrypt key', 'decrypt iv', 'decrypted.file');

				// default arguments are not used
				assert.isTrue(encryptedKeyFileStub.notCalled);
				assert.isTrue(keyFileStub.notCalled);

				// promise function is properly called
				assert.isTrue(createReadStreamStub.calledOnce);
				assert.isTrue(createWriteStreamStub.calledOnce);

				// decryptData is expected to be called with the appropriate arguments
				assert.isTrue(decryptDataStub.calledOnce);
				assert.isTrue(decryptDataStub.calledWith('readStream', 'decrypt key', 'decrypt iv'));

				// decryptData pipe properly closed
				assert.isTrue(deployKeyDecrypted);
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

				return assertDecryptDeployKey().then(
					throwWithError('Should reject when necessary files don\'t exist'),
					(err: Error) => {
						assert.strictEqual(err.message, 'error');
					}
				);
			}
		};
	})()
});
