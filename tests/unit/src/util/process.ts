import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { stub, SinonStub } from 'sinon';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import * as process from 'src/util/process';
import { LogStream } from 'src/log';

let module: any;
let execStub: SinonStub;
let spawnStub: SinonStub;

registerSuite({
	name: 'util/process',

	before() {
		execStub = stub();
		spawnStub = stub();
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		module = loadModule('src/util/process', {
			child_process: {
				exec: execStub,
				spawn: spawnStub
			}
		});
	},

	afterEach() {
		execStub.reset();
		spawnStub.reset();
	},

	promisify: {
		'promisify eventually resolves the returned promise'() {
			process.promisify(process.exec('ls', { silent: true })).then((procVal) => {
				assert.isOk(procVal);
			});
		},

		'if child process has exit code other than 0, promisify eventually rejects the returned promise'() {
			process.promisify(process.exec('not-a-command', { silent: true })).then(() => {
				assert.fail();
			}, (e) => {
				assert.instanceOf(e, Error);
			});
		}
	},

	exec: {
		'execChild is called, the return value of which is returned; options not applied'() {
			let value = 'ls';

			execStub.returns(value);

			let proc = module.exec(value, { silent: true });

			assert.isTrue(execStub.calledOnce);
			assert.strictEqual(proc, value);
		},

		'options applied after execChild is called'() {
			// required for the internal named function `applyOptions`
			execStub.returns({
				stdout: { pipe: stub() },
				stderr: { pipe: stub() }
			});

			const proc = module.exec('ls', { silent: false });

			assert.isTrue(proc.stdout.pipe.calledOnce);
			assert.isTrue(proc.stderr.pipe.calledOnce);
			assert.instanceOf(proc.stdout.pipe.lastCall.args[0], LogStream);
			assert.instanceOf(proc.stderr.pipe.lastCall.args[0], LogStream);
		}
	},

	promiseExec: {
		// 'returns exec wrapped in promise, called with specified options'() {
		// 	const command = 'ls';
		// 	const opts = { silent: true };
		// 	const promisifySpy = spy(process, 'promisify');
		// 	const processExecSpy = spy(process, 'exec');
		// 	const execPromise = module.promiseExec(command, opts);

		// 	assert.instanceOf(execPromise, Promise);
		// 	assert.isTrue(promisifySpy.calledOnce);
		// 	assert.isTrue(processExecSpy.calledOnce);
		// 	assert.isTrue(processExecSpy.calledWith(command, opts));
		// },

		// 'sets options.silent to false if unavailable'() {
		// 	const processExecStub = stub(module, 'exec');

		// 	module.promiseExec('not-a-command', {});

		// 	assert.isTrue(processExecStub.calledWith('not-a-command', { silent: false }));
		// }
	},

	spawn: {
		'spawnChild is called, the return value of which is returned; options not applied'() {
			let value = 'ls';

			spawnStub.returns(value);

			let proc = module.spawn(value, [ '-l' ], { silent: true });

			assert.isTrue(spawnStub.calledOnce);
			assert.strictEqual(proc, value);
		},

		'options applied after spawnChild is called'() {
			// required for the internal named function `applyOptions`
			spawnStub.returns({
				stdout: { pipe: stub() },
				stderr: { pipe: stub() }
			});

			const proc = module.spawn('ls', [ '-l' ], { silent: false });

			assert.isTrue(proc.stdout.pipe.calledOnce);
			assert.isTrue(proc.stderr.pipe.calledOnce);
			assert.instanceOf(proc.stdout.pipe.lastCall.args[0], LogStream);
			assert.instanceOf(proc.stderr.pipe.lastCall.args[0], LogStream);
		}
	},

	promiseSpawn() {
		// stub promisify and assert called once
		// stub spawn and assert called once
		// assert return is wrapped in promise
	}
});
