import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as Test from 'intern/lib/Test';
import * as grunt from 'grunt';
import {SinonStub, stub} from 'sinon';
import loadModule, { cleanupModuleMocks } from '../../_support/loadModule';
import { setupWrappedAsyncStub } from '../../_support/tasks';

let prebuild: any;
let registerTaskStub: SinonStub;

const wrapAsyncTaskStub = stub();
const decryptDeployKeyStub = stub();
const loggerStub = { info: stub() };

registerSuite({
	name: 'tasks/prebuild',

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		registerTaskStub = stub(grunt, 'registerTask');
		prebuild = loadModule('tasks/prebuild', {
			'./util/wrapAsyncTask': { default: wrapAsyncTaskStub },
			'../src/commands/decryptDeployKey': { default: decryptDeployKeyStub },
			'../src/log': { logger: loggerStub }
		});
	},

	afterEach() {
		wrapAsyncTaskStub.reset();
		decryptDeployKeyStub.reset();
		loggerStub.info.reset();

		registerTaskStub.restore();
	},

	'decryptDeployKey': (() => {
		function assertInWrappedAsyncStub(test: Test, shouldLog: boolean) {
			setupWrappedAsyncStub(wrapAsyncTaskStub, test.async(), () => {
				assert.isTrue(registerTaskStub.calledOnce);
				assert.isTrue(decryptDeployKeyStub.calledOnce);
				if (shouldLog) {
					assert.isTrue(
						loggerStub.info.calledWith('Decrypted deploy key'),
						'Should have logged that the key was decrypted'
					);
				}
				else {
					assert.isTrue(loggerStub.info.notCalled, 'Should not have logged that the key was decrypted');
				}
			});
		}

		function testPrebuild(test: Test, wasDecryptionSuccessful: boolean) {
			assertInWrappedAsyncStub(test, wasDecryptionSuccessful);

			decryptDeployKeyStub.returns(Promise.resolve(wasDecryptionSuccessful));

			prebuild(grunt);

			assert.isTrue(wrapAsyncTaskStub.calledOnce);
		}

		return {
			'successful decryption'(this: Test) {
				testPrebuild(this, true);
			},

			'decryption failed'(this: Test) {
				testPrebuild(this, false);
			}
		};
	})()
});
