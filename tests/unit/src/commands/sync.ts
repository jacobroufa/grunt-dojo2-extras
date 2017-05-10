import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { spy, stub, SinonSpy, SinonStub } from 'sinon';

let sync: any;
let GitSpy: SinonSpy;
let checkoutStub: SinonStub;
let isInitializedStub: SinonStub;

const syncOptions = {
	branch: 'master',
	cloneDirectory: 'dir',
	url: 'http://web.site'
};

registerSuite({
	name: 'commands/sync',

	before() {
		checkoutStub = stub();
		isInitializedStub = stub();

		const Git = class {
			assert: SinonStub = stub();
			checkout: SinonStub = checkoutStub;
			clone: SinonStub = stub();
			createOrphan: SinonStub = stub();
			ensureConfig: SinonStub = stub();
			isInitialized: SinonStub = isInitializedStub;
			pull: SinonStub = stub();
		};

		GitSpy = spy(Git);
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		sync = loadModule('src/commands/sync', {
			'../util/Git': { default: GitSpy }
		});
	},

	afterEach() {
		GitSpy.reset();
		checkoutStub.reset();
		isInitializedStub.reset();
	},

	sync: (() => {
		return {
			async 'Git initialized; checkout eventually resolves'() {
				checkoutStub.returns(Promise.resolve('master'));
				isInitializedStub.returns(true);

				await assertSync();

				const git = GitSpy.lastCall.returnValue;

				assert.isTrue(git.assert.calledOnce);
				assert.isTrue(git.pull.calledOnce);
			},

			async 'Git not initialized; checkout eventually resolves'() {
				checkoutStub.returns(Promise.resolve());
				isInitializedStub.returns(false);

				await assertSync();

				const git = GitSpy.lastCall.returnValue;

				assert.isTrue(git.clone.calledOnce);
				assert.isTrue(git.pull.calledOnce);
			},

			async 'Git checkout eventually rejects'() {
				checkoutStub.returns(Promise.reject());
				isInitializedStub.returns(true);

				await assertSync();

				const git = GitSpy.lastCall.returnValue;

				assert.isTrue(git.createOrphan.calledOnce);
			}
		};

		async function assertSync() {
			await sync(syncOptions);

			const git = GitSpy.lastCall.returnValue;

			assert.isTrue(GitSpy.calledOnce);
			assert.isTrue(git.ensureConfig.calledOnce);
			assert.isTrue(git.isInitialized.calledOnce);
			assert.isTrue(git.checkout.calledOnce);
		}
	})()
});
