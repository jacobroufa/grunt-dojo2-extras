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
			'../src/commands/decryptDeployKey': { default: decryptDeployKeyStub }
		});
	},

	afterEach() {
		registerTaskStub.reset();
		wrapAsyncTaskStub.reset();
		decryptDeployKeyStub.reset();
	},

	'decryptDeployKey': (() => {
		return {
			'returns something'(this: Test) {
				assertInWrappedAsyncStub.call(this);

				decryptDeployKeyStub.returns(Promise.resolve(true));

				prebuild(grunt);

				assert.isTrue(wrapAsyncTaskStub.calledOnce);
			},

			'returns nothing'(this: Test) {
				assertInWrappedAsyncStub.call(this);

				decryptDeployKeyStub.returns(Promise.resolve(false));

				prebuild(grunt);

				assert.isTrue(wrapAsyncTaskStub.calledOnce);
			}
		};

		function assertInWrappedAsyncStub(this: Test) {
			setupWrappedAsyncStub(wrapAsyncTaskStub, this.async(), () => {
				assert.isTrue(registerTaskStub.calledOnce);
				assert.isTrue(decryptDeployKeyStub.calledOnce);
			});
		}
	})()
});
