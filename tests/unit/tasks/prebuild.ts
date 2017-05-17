import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as grunt from 'grunt';
import { loadTasks, unloadTasks, runGruntTask } from '../../_support/loadGrunt';
import { stub } from 'sinon';

const decryptDeployKeyStub = stub();

registerSuite({
	name: 'tasks/prebuild',

	setup() {
		grunt.initConfig({});

		loadTasks({
			'../src/commands/decryptDeployKey': { default: decryptDeployKeyStub }
		});
	},

	teardown() {
		unloadTasks();
	},

	afterEach() {
		decryptDeployKeyStub.reset();
	},

	'prebuildTask eventually resolves'(this: any) {
		decryptDeployKeyStub.returns(Promise.resolve());
		const dfd = this.async();
		runGruntTask('prebuild', dfd.callback((result: any) => {
			assert.isUndefined(result);
			assert.isTrue(decryptDeployKeyStub.calledOnce);
		}));
	},

	'prebuildTask eventually rejects'(this: any) {
		decryptDeployKeyStub.returns(Promise.reject());
		const dfd = this.async();
		runGruntTask('prebuild', dfd.callback((result: any) => {
			assert.isFalse(result);
			assert.isTrue(decryptDeployKeyStub.calledOnce);
		}));
	}
});
