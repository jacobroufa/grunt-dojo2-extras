import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { stub, SinonStub } from 'sinon';

let module: any;
let GitStub: SinonStub;

registerSuite({
	name: 'commands/sync',

	before() {
		GitStub = stub().returns({
			ensureConfig: stub(),
			isInitialized: stub(),
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
	},

	sync: {
		async 'Git initialized'() {
		},

		async 'Git not initialized'() {
		}
	}
});
