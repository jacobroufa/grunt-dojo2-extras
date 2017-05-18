import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as grunt from 'grunt';
import { loadTasks, unloadTasks, runGruntTask } from '../../_support/loadGrunt';
import { stub, spy, SinonStub, SinonSpy } from 'sinon';

let GitHub: any;
let Git: any;
let GitHubSpy: SinonSpy;
let GitSpy: SinonSpy;

const getGithubSlugStub = stub();
const syncStub = stub();
const getConfigStub = stub();

registerSuite({
	name: 'tasks/sync',

	setup() {
		grunt.initConfig({
			sync: {
				latest: {
					options: {
						branch: 'latest',
						cloneDirectory: 'cloneDirectory'
					}
				}
			}
		});

		Git = class {
			constructor() {}
			getConfig: SinonStub = getConfigStub;
		};

		GitSpy = spy(Git);

		GitHub = class {
			constructor() {
				return this;
			}
			url: 'github.url';
		};

		GitHubSpy = spy(GitHub);

		loadTasks({
			'../src/commands/sync': { default: syncStub },
			'./util/getGithubSlug': { default: getGithubSlugStub },
			'../src/util/GitHub': { default: GitHubSpy },
			'../src/util/Git': { default: GitSpy }
		});
	},

	teardown() {
		unloadTasks();
	},

	afterEach() {
		syncStub.reset();
		getGithubSlugStub.reset();
		GitSpy.reset();
		GitHubSpy.reset();
		getConfigStub.reset();
	},

	'syncTask uses GitHub repo info, calls sync; eventually resolves'(this: any) {
		getGithubSlugStub.returns({ name: 'name', owner: 'owner' });
		syncStub.returns(Promise.resolve());

		const dfd = this.async();

		runGruntTask('sync:latest', dfd.callback((result: any) => {
			assert.isTrue(getGithubSlugStub.calledOnce);
			assert.isTrue(syncStub.calledOnce);
			assert.isUndefined(result);
		}));
	},

	'syncTask calls sync; eventually rejects'(this: any) {
		getGithubSlugStub.returns({ name: 'name', owner: 'owner' });
		syncStub.returns(Promise.reject());

		const dfd = this.async();

		runGruntTask('sync:latest', dfd.callback((result: any) => {
			assert.isTrue(syncStub.calledOnce);
			assert.isFalse(result);
		}));
	},

	'syncTask uses git repo url; eventually resolves'(this: any) {
		getConfigStub.returns(Promise.resolve('repo.url'));
		getGithubSlugStub.returns({});
		syncStub.returns(Promise.resolve());

		const dfd = this.async();

		runGruntTask('sync:latest', dfd.callback((result: any) => {
			assert.isTrue(GitSpy.calledOnce);
			assert.isTrue(getConfigStub.calledOnce);
			assert.isTrue(syncStub.calledOnce);
			assert.isUndefined(result);
		}));
	},

	'syncTask has url in options; eventually resolves'(this: any) {
		grunt.config('sync.latest.options.url', 'options.url');
		syncStub.returns(Promise.resolve());

		const dfd = this.async();

		runGruntTask('sync:latest', dfd.callback((result: any) => {
			assert.isTrue(getGithubSlugStub.notCalled);
			assert.isTrue(syncStub.calledOnce);
			assert.isUndefined(result);
		}));
	}
});
