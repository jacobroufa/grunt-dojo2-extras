import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { stub, SinonStub } from 'sinon';

let publish: any;
let Git: any;
let gitCommitStub: SinonStub;
let loggerStub: SinonStub;

registerSuite({
	name: 'commands/publish',

	before() {
		Git = class {
			static cloneDirectory = 'dir';

			static getConfig: SinonStub = stub();
			static areFilesChanged: SinonStub = stub();
			static ensureConfig: SinonStub = stub();
			static add: SinonStub = stub();
			static commit: SinonStub = stub();
			static push: SinonStub = stub();
		};
		gitCommitStub = stub();
		loggerStub = stub();
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		publish = loadModule('src/commands/publish', {
			'../util/Git': { default: Git },
			'../util/environment': {
				gitCommit: gitCommitStub
			},
			'../log': {
				logger: {
					info: loggerStub
				}
			}
		});
	},

	afterEach() {
		gitCommitStub.reset();
		loggerStub.reset();
	},

	'publish': {
		async 'publishMode is a function that returns "skip"'() {
			const opts = {
				branch: 'master',
				publishMode: stub().returns('skip'),
				repo: Git
			};

			await publish(opts);

			assert.isTrue(opts.publishMode.calledOnce);
			assert.strictEqual(loggerStub.lastCall.args[0], 'skipping publish.');
		},

		'publishMode is a string': (() => {
			const opts = {
				branch: 'master',
				publishMode: 'publish',
				repo: Git
			};

			return {
				async 'repo has no changes'() {
					Git.areFilesChanged.returns(false);

					await publish(opts);

					assert.isTrue(Git.areFilesChanged.calledOnce);
					assert.strictEqual(loggerStub.lastCall.args[0], 'No files changed. Skipping publish.');
				},
				'publishMode is "publish"'() {
				},
				'publishMode is "commit"': {
					'gitCommit returns true'() {
					},

					'gitCommit returns false'() {
					}
				}
			};
		})()
	}
});
