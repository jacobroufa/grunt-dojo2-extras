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
		decryptDataStub = stub().returns(decryptDataObj);
		decryptDataObj.on.returns(decryptDataObj);
		decryptDataObj.pipe.returns(decryptDataObj);
		encryptedKeyFileStub = stub();
		keyFileStub = stub();
		existsSyncStub = stub();
		createWriteStreamStub = stub().returns('writeStream');
		createReadStreamStub = stub().returns('readStream');
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		decryptDeployKey = loadModule('src/commands/decryptDeployKey', {
			'../util/crypto': {
				decryptData: decryptDataStub
			},
			'../util/environment': {
				env: {
					decryptKeyName: 'decryptKeyName',
					decryptIvName: 'decryptIvName',
					encryptedKeyFile: encryptedKeyFileStub,
					keyFile: keyFileStub
				}
			},
			'fs': {
				existsSync: existsSyncStub,
				createWriteStream: createWriteStreamStub,
				createReadStream: createReadStreamStub
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

	'decryptDeployKey': {
		async 'arguments passed in explicitly'() {
			existsSyncStub.onCall(0).returns(true);
			existsSyncStub.onCall(1).returns(false);
			decryptDataObj.on.withArgs('close').yields();

			const promise = decryptDeployKey('encrypted.file', 'decrypt key', 'decrypt iv', 'decrypted.file');

			assert.isTrue(encryptedKeyFileStub.notCalled);
			assert.isTrue(keyFileStub.notCalled);
			assert.isTrue(existsSyncStub.calledTwice);
			assert.instanceOf(promise, Promise);

			assert.isTrue(await promise);

			assert.isTrue(createReadStreamStub.calledOnce);
			assert.isTrue(createWriteStreamStub.calledOnce);
			assert.isTrue(decryptDataStub.calledOnce);
			assert.isTrue(decryptDataStub.calledWith('readStream', 'decrypt key', 'decrypt iv'));

			return promise;
		},

		'arguments obtained from default'() {
		},

		'nonexistent files and falsy arguments; eventually returns false'() {
		},

		'decryption eventually rejects'() {
		},

		'decryption eventually resolves'() {
		}
	}
});
