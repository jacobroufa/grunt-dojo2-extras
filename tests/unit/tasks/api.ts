import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as grunt from 'grunt';
import {stub, spy, SinonStub} from 'sinon';
import loadModule, { cleanupModuleMocks } from '../../_support/loadModule';
import { setupWrappedAsyncStub } from '../../_support/tasks';

let api: any;
let registerMultiTaskStub: SinonStub;

const typedocStub = stub();
const syncStub = stub();
const getReleasesStub = stub();
const createHtmlApiMissingFilterStub = stub();
const createJsonApiMissingFilterStub = stub();
const createVersionFilterStub = stub();
const getHtmlApiPathStub = stub();
const getJsonApiPathStub = stub();
const latestFilterStub = stub();
const joinStub = stub();
const resolveStub = stub();
const installDependenciesStub = stub();
const makeTempDirectoryStub = stub();
const wrapAsyncTaskStub = stub();
const optionsStub = stub();
const GitHub = class {
	name: string;
	url: string;
	constructor(owner: any, name: any) {
		this.name = name;
		this.url = `https://github.com/${owner}/${name}`;
		return this;
	}
};
const GitHubSpy = spy(GitHub);

registerSuite({
	name: 'tasks/api',

	beforeEach() {
		api = loadModule('tasks/api', {
			'../src/commands/typedoc': { default: typedocStub },
			'./util/wrapAsyncTask': { default: wrapAsyncTaskStub },
			'../src/util/GitHub': { default: GitHubSpy },
			'../src/commands/sync': { default: syncStub },
			'../src/commands/getReleases': {
				default: getReleasesStub,
				createHtmlApiMissingFilter: createHtmlApiMissingFilterStub,
				createJsonApiMissingFilter: createJsonApiMissingFilterStub,
				createVersionFilter: createVersionFilterStub,
				getHtmlApiPath: getHtmlApiPathStub,
				getJsonApiPath: getJsonApiPathStub,
				latestFilter: latestFilterStub
			},
			'path': {
				join: joinStub,
				resolve: resolveStub
			},
			'../src/commands/installDependencies': { default: installDependenciesStub },
			'../src/util/file': { makeTempDirectory: makeTempDirectoryStub }
		});
		registerMultiTaskStub = stub(grunt, 'registerMultiTask');
	},

	after() {
		cleanupModuleMocks();
	},

	afterEach() {
		typedocStub.reset();
		GitHubSpy.reset();
		syncStub.reset();
		getReleasesStub.reset();
		createHtmlApiMissingFilterStub.reset();
		createJsonApiMissingFilterStub.reset();
		createVersionFilterStub.reset();
		getHtmlApiPathStub.reset();
		getJsonApiPathStub.reset();
		latestFilterStub.reset();
		joinStub.reset();
		resolveStub.reset();
		installDependenciesStub.reset();
		makeTempDirectoryStub.reset();
		wrapAsyncTaskStub.reset();
		optionsStub.reset();

		registerMultiTaskStub.restore();
	},

	'api task has remote options including html format and string repo; no missing filters, no APIs match; eventually resolves'(this: any) {
		getReleasesStub.returns([]);
		optionsStub.returns({
			src: 'src',
			dest: 'dest',
			format: 'html',
			repo: 'user/repo',
			cloneDirectory: 'cloneDirectory',
			filter: 'filter',
			skipInstall: true,
			typedoc: {}
		});

		setupWrappedAsyncStub.call({
			options: optionsStub
		}, wrapAsyncTaskStub, this.async(), () => {
			assert.isTrue(optionsStub.calledOnce);
			assert.isTrue(GitHubSpy.calledOnce);
			assert.isTrue(joinStub.notCalled);
			assert.isTrue(makeTempDirectoryStub.notCalled);
			assert.isTrue(createVersionFilterStub.calledOnce);
			assert.isTrue(createHtmlApiMissingFilterStub.calledOnce);
			assert.isTrue(getReleasesStub.calledOnce);
			assert.isTrue(getHtmlApiPathStub.notCalled);
		});

		api(grunt);

		assert.isTrue(wrapAsyncTaskStub.calledOnce);
		assert.isTrue(registerMultiTaskStub.calledOnce);
	},

	'api task has remote options including json format and object repo; no filters, all APIs up to date; eventually resolves'(this: any) {
		getReleasesStub.returns([]);
		optionsStub.returns({
			src: 'src',
			dest: 'dest',
			format: 'json',
			repo: { owner: 'user', name: 'repo' },
			skipInstall: true,
			typedoc: {}
		});

		setupWrappedAsyncStub.call({
			options: optionsStub
		}, wrapAsyncTaskStub, this.async(), () => {
			assert.isTrue(optionsStub.calledOnce);
			assert.isTrue(GitHubSpy.calledOnce);
			assert.isTrue(joinStub.calledOnce);
			assert.isTrue(makeTempDirectoryStub.calledOnce);
			assert.isTrue(createVersionFilterStub.notCalled);
			assert.isTrue(createJsonApiMissingFilterStub.calledOnce);
			assert.isTrue(getReleasesStub.calledOnce);
			assert.isTrue(getJsonApiPathStub.notCalled);
		});

		api(grunt);

		assert.isTrue(wrapAsyncTaskStub.calledOnce);
		assert.isTrue(registerMultiTaskStub.calledOnce);
	},

	'api task has remote options including json format and object repo; latest filters, all APIs up to date; eventually resolves'(this: any) {
		getReleasesStub.returns([{ name: 'name' }]);
		optionsStub.returns({
			src: 'src',
			dest: 'dest',
			format: 'json',
			repo: { owner: 'user', name: 'repo' },
			filter: 'latest',
			skipInstall: true,
			typedoc: {}
		});

		setupWrappedAsyncStub.call({
			options: optionsStub
		}, wrapAsyncTaskStub, this.async(), () => {
			assert.isTrue(optionsStub.calledOnce);
			assert.isTrue(GitHubSpy.calledOnce);
			assert.isTrue(joinStub.calledOnce);
			assert.isTrue(makeTempDirectoryStub.calledOnce);
			assert.isTrue(createVersionFilterStub.notCalled);
			assert.isTrue(createJsonApiMissingFilterStub.calledOnce);
			assert.isTrue(getReleasesStub.calledOnce);
			assert.isTrue(getJsonApiPathStub.calledOnce);
			assert.isTrue(syncStub.calledOnce);
			assert.isTrue(installDependenciesStub.notCalled);
			assert.isTrue(typedocStub.calledOnce);
		});

		api(grunt);

		assert.isTrue(wrapAsyncTaskStub.calledOnce);
		assert.isTrue(registerMultiTaskStub.calledOnce);
	},

	'api task has remote options including filter object; runs installDependencies; eventually resolves'(this: any) {
		getReleasesStub.returns([{ name: 'name' }]);
		optionsStub.returns({
			src: 'src',
			dest: 'dest',
			format: 'html',
			repo: { owner: 'user', name: 'repo' },
			filter: {},
			skipInstall: false,
			typedoc: {}
		});

		setupWrappedAsyncStub.call({
			options: optionsStub
		}, wrapAsyncTaskStub, this.async(), () => {
			assert.isTrue(optionsStub.calledOnce);
			assert.isTrue(GitHubSpy.calledOnce);
			assert.isTrue(joinStub.calledOnce);
			assert.isTrue(makeTempDirectoryStub.calledOnce);
			assert.isTrue(createVersionFilterStub.notCalled);
			assert.isTrue(createHtmlApiMissingFilterStub.calledOnce);
			assert.isTrue(getReleasesStub.calledOnce);
			assert.isTrue(getHtmlApiPathStub.calledOnce);
			assert.isTrue(syncStub.calledOnce);
			assert.isTrue(installDependenciesStub.calledOnce);
			assert.isTrue(typedocStub.calledOnce);
		});

		api(grunt);

		assert.isTrue(wrapAsyncTaskStub.calledOnce);
		assert.isTrue(registerMultiTaskStub.calledOnce);
	},

	'api task has remote options; runs installDependencies; eventually resolves'(this: any) {
		getReleasesStub.returns([{ name: 'name' }]);
		optionsStub.returns({
			src: 'src',
			dest: 'dest',
			format: 'html',
			repo: { owner: 'user', name: 'repo' },
			filter: [],
			skipInstall: false,
			typedoc: {}
		});

		setupWrappedAsyncStub.call({
			options: optionsStub
		}, wrapAsyncTaskStub, this.async(), () => {
			assert.isTrue(optionsStub.calledOnce);
			assert.isTrue(GitHubSpy.calledOnce);
			assert.isTrue(joinStub.calledOnce);
			assert.isTrue(makeTempDirectoryStub.calledOnce);
			assert.isTrue(createVersionFilterStub.notCalled);
			assert.isTrue(createHtmlApiMissingFilterStub.calledOnce);
			assert.isTrue(getReleasesStub.calledOnce);
			assert.isTrue(getHtmlApiPathStub.calledOnce);
			assert.isTrue(syncStub.calledOnce);
			assert.isTrue(installDependenciesStub.calledOnce);
			assert.isTrue(typedocStub.calledOnce);
		});

		api(grunt);

		assert.isTrue(wrapAsyncTaskStub.calledOnce);
		assert.isTrue(registerMultiTaskStub.calledOnce);
	},

	'api task has no remote options; eventually resolves'(this: any) {
		optionsStub.returns({
			src: 'src',
			dest: 'dest',
			format: 'html',
			skipInstall: true,
			typedoc: {}
		});

		setupWrappedAsyncStub.call({
			options: optionsStub
		}, wrapAsyncTaskStub, this.async(), () => {
			assert.isTrue(optionsStub.calledOnce);
			assert.isTrue(resolveStub.calledOnce);
			assert.isTrue(typedocStub.calledOnce);
		});

		api(grunt);

		assert.isTrue(wrapAsyncTaskStub.calledOnce);
		assert.isTrue(registerMultiTaskStub.calledOnce);
	},

	'api task has no remote options; runs installDependencies; eventually resolves'(this: any) {
		optionsStub.returns({
			src: 'src',
			dest: 'dest',
			format: 'html',
			skipInstall: false,
			typedoc: {}
		});

		setupWrappedAsyncStub.call({
			options: optionsStub
		}, wrapAsyncTaskStub, this.async(), () => {
			assert.isTrue(optionsStub.calledOnce);
			assert.isTrue(installDependenciesStub.calledOnce);
			assert.isTrue(resolveStub.calledOnce);
			assert.isTrue(typedocStub.calledOnce);
		});

		api(grunt);

		assert.isTrue(wrapAsyncTaskStub.calledOnce);
		assert.isTrue(registerMultiTaskStub.calledOnce);
	}
});
