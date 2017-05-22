import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as grunt from 'grunt';
import { loadTasks, unloadTasks, runGruntTask } from '../../_support/loadGrunt';
import { stub, spy, SinonSpy } from 'sinon';

let GitHub: any;
let GitHubSpy: SinonSpy;

const authenticateStub = stub();
const getGithubSlugStub = stub();
const initDeploymentStub = stub();
const initAuthorizationStub = stub();

registerSuite({
	name: 'tasks/sync',

	setup() {
		grunt.initConfig({
			setupAuth: {
				repo: {},
				options: {
					github: {
						password: 'password',
						username: 'username'
					}
				}
			},
			setupDeploy: {}
		});

		GitHub = class {
			constructor() {
				return this;
			}
			api: any = {
				authenticate: authenticateStub
			};
		};

		GitHubSpy = spy(GitHub);

		loadTasks({
			'../src/util/GitHub': { default: GitHubSpy },
			'./util/getGithubSlug': { default: getGithubSlugStub },
			'../src/commands/initialize/initDeployment': { default: initDeploymentStub },
			'../src/commands/initialize/initAuthorization': { default: initAuthorizationStub }
		});
	},

	teardown() {
		unloadTasks();
	},

	afterEach() {
		getGithubSlugStub.reset();
		authenticateStub.reset();
		initDeploymentStub.reset();
		initAuthorizationStub.reset();
		GitHubSpy.reset();
	},

	'setupDeploy task calls initDeployment; eventually resolves'(this: any) {
		getGithubSlugStub.returns({ name: 'name', owner: 'owner' });

		const dfd = this.async();

		runGruntTask('setupDeploy', dfd.callback((result: any) => {
			assert.isTrue(getGithubSlugStub.calledOnce);
			assert.isTrue(GitHubSpy.calledOnce);
			assert.isTrue(initDeploymentStub.calledOnce);
			assert.isUndefined(result);
		}));
	},

	'setupAuth task calls initAuthorization; eventually resolves'(this: any) {
		getGithubSlugStub.returns({ name: 'name', owner: 'owner' });

		const dfd = this.async();

		runGruntTask('setupAuth', dfd.callback((result: any) => {
			assert.isTrue(getGithubSlugStub.calledOnce);
			assert.isTrue(GitHubSpy.calledOnce);
			assert.isTrue(initAuthorizationStub.calledOnce);
			assert.isUndefined(result);
		}));
	}
});
