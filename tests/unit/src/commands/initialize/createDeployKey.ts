import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../../_support/loadModule';
import { stub, SinonStub } from 'sinon';

let createDeployKey: any;
let encryptedStub: any;
let keyFileStub: SinonStub;
let encryptedKeyFileStub: SinonStub;
let existsSyncStub: SinonStub;
let createReadStreamStub: SinonStub;
let createWriteStreamStub: SinonStub;
let createKeyStub: SinonStub;
let encryptDataStub: SinonStub;
let decryptDataStub: SinonStub;
let equalStub: SinonStub;

registerSuite({
	name: 'commands/initialize/createDeployKey',

	before() {
		encryptedStub = {
			pipe: stub(),
			on: stub()
		};
		keyFileStub = stub();
		encryptedKeyFileStub = stub();
		existsSyncStub = stub();
		createReadStreamStub = stub();
		createWriteStreamStub = stub();
		createKeyStub = stub();
		encryptDataStub = stub();
		decryptDataStub = stub();
		equalStub = stub();
	},

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

			async 'Deploy key already exists'() {
				existsSyncStub.returns(true);

				try {
					await createDeployKey('deploykey.file', 'deploykey.enc');
				} catch (err) {
					assert.strictEqual(err.message, 'Deploy key already exists');
					assert.isTrue(existsSyncStub.calledOnce);
				}

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
