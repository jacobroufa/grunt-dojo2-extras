import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as grunt from 'grunt';
import { loadTasks, unloadTasks, runGruntTask } from '../../_support/loadGrunt';
import { stub, spy, SinonSpy } from 'sinon';

let Git: any;
let GitSpy: SinonSpy;

const publishStub = stub();
const hasGitCredentialsStub = stub();
const publishModeStub = stub();

registerSuite({
	name: 'tasks/publish',

	setup() {
		grunt.initConfig({
			publish: {
				'gh-pages': {
					options: {
						branch: 'gh-pages',
						cloneDirectory: '<%= cloneDirectory %>'
					}
				},
				latest: {
					options: {
						branch: 'latest',
						cloneDirectory: '<%= cloneDirectory %>'
					}
				}
			}
		});

		Git = class {
			constructor() {}
		};

		GitSpy = spy(Git);

		loadTasks({
			'../src/commands/publish': { default: publishStub },
			'../src/util/Git': { default: GitSpy },
			'../src/util/environment': {
				hasGitCredentials: hasGitCredentialsStub,
				publishMode: publishModeStub
			}
		});
	},

	teardown() {
		unloadTasks();
	},

	beforeEach() {
		publishStub.returns(Promise.resolve());
	},

	afterEach() {
		publishStub.reset();
		hasGitCredentialsStub.reset();
		publishModeStub.reset();
		GitSpy.reset();
	},

	'publish task runs, has git credentials; eventually resolves'(this: any) {
		hasGitCredentialsStub.returns(true);

		const dfd = this.async();

		runGruntTask('publish', dfd.callback((result: any) => {
			assert.isTrue(hasGitCredentialsStub.calledOnce);
			assert.isTrue(publishModeStub.calledOnce);
			assert.isTrue(GitSpy.calledOnce);
			assert.isTrue(publishStub.calledOnce);
			assert.isUndefined(result);
		}));
	},

	'publish task runs, has no git credentials; eventually resolves'(this: any) {
		const dfd = this.async();

		runGruntTask('publish', dfd.callback((result: any) => {
			assert.isTrue(hasGitCredentialsStub.calledOnce);
			assert.isTrue(publishModeStub.notCalled);
			assert.isTrue(GitSpy.calledOnce);
			assert.isTrue(publishStub.calledOnce);
			assert.isUndefined(result);
		}));
	}
});
