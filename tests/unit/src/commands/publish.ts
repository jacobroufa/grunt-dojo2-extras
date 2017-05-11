import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { stub, SinonStub } from 'sinon';

let publish: any;
let gitCommitStub: SinonStub;

registerSuite({
	name: 'commands/publish',

	before() {
		gitCommitStub = stub();
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		publish = loadModule('src/commands/publish', {
			'../util/environment': {
				gitCommit: gitCommitStub
			}
		});
	},

	afterEach() {
		gitCommitStub.reset();
	},

	'publish': {
		async 'publishMode is a function that returns "skip"'() {
			const opts = {
				branch: 'master',
				publishMode: stub().returns('skip'),
				repo: {
					areFilesChanged: stub()
				}
			};

			await publish(opts);

			assert.isTrue(opts.publishMode.calledOnce);
			assert.isTrue(opts.repo.areFilesChanged.notCalled);
		},

		'publishMode is a string': (() => {
			let opts: any;

			return {
				beforeEach() {
					opts = {
						branch: 'master',
						publishMode: 'commit',
						repo: {
							add: stub().returns(Promise.resolve()),
							areFilesChanged: stub().returns(Promise.resolve(true)),
							commit: stub().returns(Promise.resolve()),
							ensureConfig: stub().returns(Promise.resolve()),
							getConfig: stub().returns(Promise.resolve('username')),
							push: stub().returns(Promise.resolve())
						}
					};
				},

				afterEach() {
					opts.repo.add.reset();
					opts.repo.areFilesChanged.reset();
					opts.repo.commit.reset();
					opts.repo.ensureConfig.reset();
					opts.repo.getConfig.reset();
					opts.repo.push.reset();
				},

				async 'repo has no changes'() {
					const areFilesChanged = opts.repo.areFilesChanged;

					areFilesChanged.returns(Promise.resolve(false));

					await publish(opts);

					assert.isTrue(areFilesChanged.calledOnce);
					assert.isTrue(opts.repo.ensureConfig.notCalled);
				},

				async 'publishMode is "commit"; gitCommit returns value'() {
					gitCommitStub.returns('a35de344');

					await publish(opts);

					assert.isTrue(opts.repo.ensureConfig.calledOnce);
					assert.isTrue(opts.repo.add.calledOnce);
					assert.isTrue(opts.repo.commit.calledOnce);
					assert.isTrue(opts.repo.commit.calledWith('Published by username from commit a35de344'));
					assert.isTrue(opts.repo.push.notCalled);
				},

				async 'publishMode is "commit"; gitCommit returns falsy'() {
					gitCommitStub.returns(undefined);

					await publish(opts);

					assert.isTrue(opts.repo.commit.calledWith('Published by username'));
				},

				async 'publishMode is "publish"'() {
					opts.publishMode = 'publish';

					await publish(opts);

					assert.isTrue(opts.repo.push.calledOnce);
				}
			};
		})()
	}
});
