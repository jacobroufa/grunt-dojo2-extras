import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { stub, SinonStub } from 'sinon';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import * as process from '../../../../src/util/process';

let module: any;
let execStub: SinonStub;
let spawnStub: SinonStub;
let loggerStub: SinonStub;
let LogStreamStub: SinonStub;

registerSuite({
	name: 'util/process',

	before() {
		execStub = stub();
		spawnStub = stub();
		loggerStub = stub();
		LogStreamStub = stub();
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		module = loadModule('src/util/process', {
			child_process: {
				exec: execStub,
				spawn: spawnStub
			},
			'../log': {
				logger: {
					debug: loggerStub
				},
				LogStream: LogStreamStub
			}
		});
	},

	afterEach() {
		execStub.reset();
		spawnStub.reset();
		loggerStub.reset();
		LogStreamStub.reset();
	},

	promisify() {
		process.promisify(process.exec('ls', { silent: true })).then((procVal) => {
			assert.isOk(procVal);
		});

		process.promisify(process.exec('not-a-command', { silent: true })).then(() => {
			assert.fail();
		}, (e) => {
			assert.instanceOf(e, Error);
		});
	},

	exec() {
		let value = 'ls';

		execStub.returns(value);

		let proc = module.exec(value, { silent: true });

		assert.isTrue(loggerStub.calledOnce);
		assert.isTrue(loggerStub.calledWith('exec ls'));
		assert.isTrue(execStub.calledOnce);
		assert.isTrue(LogStreamStub.notCalled);
		assert.strictEqual(proc, value);

		execStub.returns({
			stdout: { pipe: stub() },
			stderr: { pipe: stub() }
		});

		module.exec(value, { silent: false });
		assert.isTrue(LogStreamStub.calledTwice);
	},

	async promiseExec() {
		module.promiseExec('ls', { silent: true }).then((procVal: any) => {
			assert.isOk(procVal);
		});

		module.promiseExec('not-a-command', { silent: true }).then(() => {
			assert.fail();
		}, (e: Error) => {
			assert.instanceOf(e, Error);
		});
	},

	spawn() {
		// stub logger.debug and assert calledOnce
		// stub spawnChild and assert calledOnce
		// sutb applyOptions? and assert calledOnce
	},

	promiseSpawn() {
		// stub promisify and assert called once
		// stub spawn and assert called once
		// assert return is wrapped in promise
	}
});
