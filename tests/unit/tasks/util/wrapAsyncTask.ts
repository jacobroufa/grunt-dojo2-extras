import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as grunt from 'grunt';
import { stub } from 'sinon';
import { loadTasks, runGruntTask, unloadTasks } from '../../../_support/loadGrunt';

const syncStub = stub();
const getGithubSlugStub = stub();

registerSuite({
	name: 'tasks/util/wrapAsyncTask',

	setup() {
		grunt.initConfig({
			sync: { latest: { options: {
				branch: 'latest',
				cloneDirectory: 'cloneDirectory'
			}}}
		});

		loadTasks({
			'../src/commands/sync': { default: syncStub },
			'./util/getGithubSlug': { default: getGithubSlugStub }
		});
	},

	teardown() {
		unloadTasks();
	},

	afterEach() {
		syncStub.reset();
		getGithubSlugStub.reset();
	},

	'task eventually completes'(this: any) {
		getGithubSlugStub.returns({ name: 'name', owner: 'owner' });
		syncStub.returns(Promise.resolve());

		const dfd = this.async();

		runGruntTask('sync:latest', dfd.callback((result: any) => {
			assert.isUndefined(result);
		}));
	},

	'task eventually rejects'(this: any) {
		getGithubSlugStub.returns({ name: 'name', owner: 'owner' });
		syncStub.returns(Promise.reject());

		const dfd = this.async();

		runGruntTask('sync:latest', dfd.callback((result: any) => {
			assert.isFalse(result);
		}));
	}
});
