import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as grunt from 'grunt';
import { stub, spy } from 'sinon';
import loadModule, { cleanupModuleMocks } from '../../_support/loadModule';
import { setupWrappedAsyncStub } from '../../_support/tasks';

let setup: any;

const authenticateStub = stub();
const getGithubSlugStub = stub();
const initDeploymentStub = stub();
const initAuthorizationStub = stub();
const wrapAsyncTaskStub = stub();
const optionsStub = stub();
const registerMultiTaskStub = stub(grunt, 'registerMultiTask');
const GitHub = class {
	constructor() {
		return this;
	}
	api: any = {
		authenticate: authenticateStub
	};
};
const GitHubSpy = spy(GitHub);

registerSuite({
	name: 'tasks/setup',

	beforeEach() {
		setup = loadModule('tasks/setup', {
			'./util/wrapAsyncTask': { default: wrapAsyncTaskStub },
			'../src/util/GitHub': { default: GitHubSpy },
			'./util/getGithubSlug': { default: getGithubSlugStub },
			'../src/commands/initialize/initDeployment': { default: initDeploymentStub },
			'../src/commands/initialize/initAuthorization': { default: initAuthorizationStub }
		});
	},

	after() {
		cleanupModuleMocks();
		registerMultiTaskStub.restore();
	},

	afterEach() {
		getGithubSlugStub.reset();
		authenticateStub.reset();
		initDeploymentStub.reset();
		initAuthorizationStub.reset();
		wrapAsyncTaskStub.reset();
		optionsStub.reset();
		GitHubSpy.reset();
		registerMultiTaskStub.reset();
	},

	'setup calls initDeployment and initAuthorization; eventually resolves'(this: any) {
		let counter = 0;

		getGithubSlugStub.returns({ name: 'name', owner: 'owner' });
		optionsStub.returns({ password: 'password', username: 'username' });

		setupWrappedAsyncStub.call({
			options: optionsStub
		}, wrapAsyncTaskStub, this.async(), () => {
			// because wrapAsyncTask is called twice in this SUT, we don't want to run
			// any assertions until it has been called both times.
			if (counter >= 1) {
				assert.isTrue(optionsStub.calledTwice);
				assert.isTrue(registerMultiTaskStub.calledTwice);
				assert.isTrue(getGithubSlugStub.calledTwice);
				assert.isTrue(GitHubSpy.calledTwice);
				assert.isTrue(initDeploymentStub.calledOnce);
				assert.isTrue(initAuthorizationStub.calledOnce);
			}
			counter++;
		});

		setup(grunt);

		assert.isTrue(wrapAsyncTaskStub.calledTwice);
	}
});
