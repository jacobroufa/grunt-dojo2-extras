import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as grunt from 'grunt';
import loadModule, { cleanupModuleMocks } from '../../_support/loadModule';
import { stub } from 'sinon';

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

	'prebuildTask eventually resolves'(this: any) {
		wrapAsyncTaskStub.yieldsAsync(this);
		decryptDeployKeyStub.returns(true);

		try {
			prebuild(grunt);
		} catch (e) {
			// should not throw
			console.log(e);
		}

		assert.isTrue(registerTaskStub.calledOnce);
		assert.isTrue(wrapAsyncTaskStub.calledOnce);
		assert.isTrue(decryptDeployKeyStub.calledOnce);
	},

	'prebuildTask eventually rejects'(this: any) {
		wrapAsyncTaskStub.yieldsAsync(this);
		decryptDeployKeyStub.returns(false);

		try {
			prebuild(grunt);
		} catch (e) {
			// might throw
			console.log(e);
		}

		assert.isTrue(registerTaskStub.calledOnce);
		assert.isTrue(wrapAsyncTaskStub.calledOnce);
		assert.isTrue(decryptDeployKeyStub.calledOnce);
	}
});
