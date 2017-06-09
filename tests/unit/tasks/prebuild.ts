import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as Test from 'intern/lib/Test';
import * as grunt from 'grunt';
import { stub } from 'sinon';
import loadModule, { cleanupModuleMocks } from '../../_support/loadModule';
import { setupWrappedAsyncStub } from '../../_support/tasks';

let prebuild: any;

const wrapAsyncTaskStub = stub();
const decryptDeployKeyStub = stub();
const loggerStub = { info: stub() };
const registerTaskStub = stub(grunt, 'registerTask');

registerSuite({
	name: 'tasks/prebuild',

	after() {
		cleanupModuleMocks();
		registerTaskStub.restore();
	},

	beforeEach() {
		prebuild = loadModule('tasks/prebuild', {
			'./util/wrapAsyncTask': { default: wrapAsyncTaskStub },
			'../src/commands/decryptDeployKey': { default: decryptDeployKeyStub },
			'../src/log': { logger: loggerStub }
		});
	},

	afterEach() {
		registerTaskStub.reset();
		wrapAsyncTaskStub.reset();
		decryptDeployKeyStub.reset();
		loggerStub.info.reset();
	},

	'decryptDeployKey': (() => {
		function assertInWrappedAsyncStub(test: Test, shouldLog: boolean = false) {
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

		return {
			'successful decryption'(this: Test) {
				assertInWrappedAsyncStub.call(this);

				decryptDeployKeyStub.returns(Promise.resolve(true));

				prebuild(grunt);

				assert.isTrue(wrapAsyncTaskStub.calledOnce);
			},

			'decryption failed'(this: Test) {
				assertInWrappedAsyncStub.call(this);

				decryptDeployKeyStub.returns(Promise.resolve(false));

				prebuild(grunt);

				assert.isTrue(wrapAsyncTaskStub.calledOnce);
			}
		};
	})()
});
