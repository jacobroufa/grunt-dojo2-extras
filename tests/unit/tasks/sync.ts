import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as grunt from 'grunt';
import loadModule, { cleanupModuleMocks } from '../../_support/loadModule';
import { stub, spy, SinonStub } from 'sinon';

let sync: any;
let taskOptions: any;

const getGithubSlugStub = stub();
const syncStub = stub();
const getConfigStub = stub();
const wrapAsyncTaskStub = stub();
const registerMultiTaskStub = stub(grunt, 'registerMultiTask');

const Git = class {
	constructor() {}
	getConfig: SinonStub = getConfigStub;
};
const GitHub = class {
	constructor() {
		return this;
	}
	url: 'github.url';
};

const GitSpy = spy(Git);
const GitHubSpy = spy(GitHub);

registerSuite({
	name: 'tasks/sync',

	after() {
		cleanupModuleMocks();
		registerMultiTaskStub.restore();
	},

	beforeEach() {
		sync = loadModule('tasks/sync', {
			'../src/commands/sync': { default: syncStub },
			'./util/wrapAsyncTask': { default: wrapAsyncTaskStub.yieldsAsync({
				options: taskOptions
			}) },
			'./util/getGithubSlug': { default: getGithubSlugStub },
			'../src/util/GitHub': { default: GitHubSpy },
			'../src/util/Git': { default: GitSpy }
		});
	},

	afterEach() {
		syncStub.reset();
		getGithubSlugStub.reset();
		GitSpy.reset();
		GitHubSpy.reset();
		getConfigStub.reset();
		wrapAsyncTaskStub.reset();
	},

	'syncTask uses GitHub repo info, calls sync; eventually resolves'(this: any) {
		taskOptions = (opts: any) => opts;
		getGithubSlugStub.returns({ name: 'name', owner: 'owner' });
		syncStub.returns(Promise.resolve());

		sync(grunt);

		assert.isTrue(registerMultiTaskStub.calledOnce);
		assert.isTrue(wrapAsyncTaskStub.calledOnce);

		assert.isTrue(getGithubSlugStub.calledOnce);
		assert.isTrue(GitHubSpy.calledOnce);

		assert.isTrue(syncStub.calledOnce);
	},

	'syncTask calls sync; eventually rejects'(this: any) {
		taskOptions = (opts: any) => opts;
		getGithubSlugStub.returns({ name: 'name', owner: 'owner' });
		syncStub.returns(Promise.reject());

		sync(grunt);

		assert.isTrue(registerMultiTaskStub.calledOnce);
		assert.isTrue(wrapAsyncTaskStub.calledOnce);

		assert.isTrue(syncStub.calledOnce);
	},

	'syncTask uses git repo url; eventually resolves'(this: any) {
		taskOptions = (opts: any) => opts;
		getConfigStub.returns(Promise.resolve('repo.url'));
		getGithubSlugStub.returns({});
		syncStub.returns(Promise.resolve());

		sync(grunt);

		assert.isTrue(registerMultiTaskStub.calledOnce);
		assert.isTrue(wrapAsyncTaskStub.calledOnce);

		assert.isTrue(GitSpy.calledOnce);
		assert.isTrue(getConfigStub.calledOnce);

		assert.isTrue(syncStub.calledOnce);
	},

	'syncTask has url in options; eventually resolves'(this: any) {
		taskOptions = () => {
			return { url: 'options.url' };
		};
		syncStub.returns(Promise.resolve());

		sync(grunt);

		assert.isTrue(registerMultiTaskStub.calledOnce);
		assert.isTrue(wrapAsyncTaskStub.calledOnce);

		assert.isTrue(getGithubSlugStub.notCalled);

		assert.isTrue(syncStub.calledOnce);
	}
});
