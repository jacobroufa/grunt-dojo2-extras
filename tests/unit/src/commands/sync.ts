import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { stub, SinonStub } from 'sinon';

let module: any;
let GitStub: SinonStub;
let isInitializedStub: SinonStub;

const syncOptions = {
	branch: 'master',
	cloneDirectory: 'dir',
	url: 'http://web.site'
};

registerSuite({
	name: 'commands/sync',

	before() {
		isInitializedStub = stub();
		GitStub = stub().returns({
			ensureConfig: stub(),
			isInitialized: isInitializedStub,
			assert: stub(),
			clone: stub(),
			checkout: stub(),
			pull: stub(),
			createOrphan: stub()
		});
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		module = loadModule('src/commands/sync', {
			Git: GitStub
		});
	},

	afterEach() {
		GitStub.reset();
		isInitializedStub.reset();
	},

	sync: {
		async 'Git initialized'() {
			isInitializedStub.returns(true);
			await module.sync(syncOptions);

			assert.isTrue(GitStub.calledOnce);
		},

		async 'Git not initialized'() {
			isInitializedStub.returns(false);
			await module.sync(syncOptions);

			assert.isTrue(GitStub.calledOnce);
		}
	}
});
