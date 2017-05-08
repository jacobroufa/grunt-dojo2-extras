import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { stub, SinonStub } from 'sinon';

let module: any;
let existsSyncStub: SinonStub;
let mkdtempSyncStub: SinonStub;
let syncStub: SinonStub;
let joinStub: SinonStub;

registerSuite({
	name: 'util/file',

	before() {
		existsSyncStub = stub();
		mkdtempSyncStub = stub();
		syncStub = stub();
		joinStub = stub();
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		module = loadModule('src/util/file', {
			'fs': {
				existsSync: existsSyncStub,
				mkdtempSync: mkdtempSyncStub
			},
			'mkdirp': {
				sync: syncStub
			},
			'path': {
				join: joinStub
			}
		});
	},

	afterEach() {
		existsSyncStub.reset();
		mkdtempSyncStub.reset();
		syncStub.reset();
		joinStub.reset();
	},

	makeTempDirectory: {
		'base directory should be created if it does not exist'() {
			existsSyncStub.returns(false);

			module.makeTempDirectory('dir');

			assert.isTrue(existsSyncStub.calledOnce);
			assert.isTrue(syncStub.calledOnce);
		},

		'prefix should default to "tmp-" if not provided'() {
			existsSyncStub.returns(true);

			module.makeTempDirectory('dir');

			assert.isTrue(joinStub.calledWith('dir', 'tmp-'));
		},

		'value of mkdtempSync should be returned'() {
			existsSyncStub.returns(true);
			mkdtempSyncStub.returns('temp_dir');

			const tempDir = module.makeTempDirectory('dir', 'temp_');

			assert.isTrue(joinStub.calledWith('dir', 'temp_'));
			assert.isTrue(mkdtempSyncStub.calledOnce);
			assert.strictEqual(tempDir, 'temp_dir');
		}
	}
});
