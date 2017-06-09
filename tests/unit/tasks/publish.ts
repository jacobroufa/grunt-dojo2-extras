import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as grunt from 'grunt';
import { stub, spy, SinonStub } from 'sinon';
import loadModule, { cleanupModuleMocks } from '../../_support/loadModule';
import { setupWrappedAsyncStub } from '../../_support/tasks';

let publish: any;
let gruntOptionStub: SinonStub = stub(grunt, 'option');

const Git = class {
	constructor() {}
};
const GitSpy = spy(Git);
const publishStub = stub();
const hasGitCredentialsStub = stub();
const publishModeStub = stub();
const wrapAsyncTaskStub = stub();
const optionsStub = stub();

registerSuite({
	name: 'tasks/publish',

	after() {
		cleanupModuleMocks();
		gruntOptionStub.restore();
	},

	beforeEach() {
		optionsStub.yieldsTo('publishMode').returns({
			cloneDirectory: 'cloneDirectory',
			publishMode: null,
			repo: null
		});

		publish = loadModule('tasks/publish', {
			'../src/commands/publish': { default: publishStub.returns(Promise.resolve()) },
			'../src/util/Git': { default: GitSpy },
			'./util/wrapAsyncTask': { default: wrapAsyncTaskStub },
			'../src/util/environment': {
				hasGitCredentials: hasGitCredentialsStub,
				publishMode: publishModeStub
			}
		});
	},

	afterEach() {
		publishStub.reset();
		hasGitCredentialsStub.reset();
		publishModeStub.reset();
		GitSpy.reset();
		wrapAsyncTaskStub.reset();
		optionsStub.reset();
	},

	'publish task runs, has git credentials; eventually resolves'(this: any) {
		gruntOptionStub.returns('publishMode');
		hasGitCredentialsStub.returns(true);

		setupWrappedAsyncStub.call({
			options: optionsStub
		}, wrapAsyncTaskStub, this.async(), () => {
			assert.isTrue(hasGitCredentialsStub.calledOnce, 'Should always check for git credentials');
			assert.isTrue(GitSpy.calledOnce, 'Should always create a git utility');
			assert.isTrue(publishStub.calledOnce, 'Should always call publish');

			assert.isTrue(publishModeStub.calledOnce, 'Should call publishMode when there are git credentials');
		});

		publish(grunt);

		assert.isTrue(wrapAsyncTaskStub.calledOnce);
	},

	'publish task runs, has no git credentials; eventually resolves'(this: any) {
		setupWrappedAsyncStub.call({
			options: optionsStub
		}, wrapAsyncTaskStub, this.async(), () => {
			assert.isTrue(hasGitCredentialsStub.calledOnce, 'Should always check for git credentials');
			assert.isTrue(GitSpy.calledOnce, 'Should always create a git utility');
			assert.isTrue(publishStub.calledOnce, 'Should always call publish');

			assert.isTrue(publishModeStub.notCalled, 'Shouldn\'t call publish mode when there are no git credentials');
		});

		publish(grunt);

		assert.isTrue(wrapAsyncTaskStub.calledOnce);
	}
});
