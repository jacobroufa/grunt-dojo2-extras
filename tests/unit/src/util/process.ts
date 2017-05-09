import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { stub, SinonStub } from 'sinon';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import * as processUtil from 'src/util/process';
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

	promisify: (() => {
		const proc = {
			stdout: { pipe: stub() },
			stderr: { pipe: stub() },
			on: stub()
		};

		stub(processUtil, 'exec').returns(proc);

		return {
			async 'eventually resolves the returned promise'() {
				const promise = processUtil.promisify(processUtil.exec('test'));

				proc.on.lastCall.args[1](0);
				assert.equal(proc, await promise);

				return promise;
			},

			async 'child process exits with code other than 0; eventually rejects the returned promise'() {
				let promise;

				try {
					promise = processUtil.promisify(processUtil.exec('test'));

					proc.on.lastCall.args[1](1);
					assert.equal(proc, await promise);
				} catch (e) {
					assert.strictEqual(e.message, 'Process exited with a code of 1');
					assert.strictEqual(process.exitCode, 1);
				}
			}
		};
	})(),

	exec: {
		'execChild is called, options not applied; execChild\'s value is returned'() {
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

	promiseExec: (() => {
		return {
			'options not applied'() {
				const promise = testExec();

				assert.equal(execStub.lastCall.args[1].silent, false);

				return promise;
			},
			'options applied, options.silent = true'() {
				const promise = testExec({ silent: true });

				assert.equal(execStub.lastCall.args[1].silent, true);

				return promise;
			},
			'options applied, options.silent undefined'() {
				const promise = testExec({});

				assert.equal(execStub.lastCall.args[1].silent, false);

				return promise;
			}
		};

		async function testExec(opts?: any) {
			const proc = {
				stdout: { pipe: stub() },
				stderr: { pipe: stub() },
				on: stub()
			};

			execStub.returns(proc);

			const promise = module.promiseExec('test', opts);

			assert.isTrue(proc.on.called);
			assert.instanceOf(promise, Promise);
			assert.isTrue(proc.on.calledWith('close'));

			proc.on.lastCall.args[1](0);
			assert.equal(proc, await promise);

			return promise;
		}
	})(),

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

	promiseSpawn: (() => {
		return {
			'options not applied'() {
				const promise = testSpawn();

				assert.equal(spawnStub.lastCall.args[2].silent, false);

				return promise;
			},
			'options applied, options.silent = true'() {
				const promise = testSpawn({ silent: true });

				assert.equal(spawnStub.lastCall.args[2].silent, true);

				return promise;
			},
			'options applied, options.silent undefined'() {
				const promise = testSpawn({});

				assert.equal(spawnStub.lastCall.args[2].silent, false);

				return promise;
			}
		};

		async function testSpawn(opts?: any) {
			const proc = {
				stdout: { pipe: stub() },
				stderr: { pipe: stub() },
				on: stub()
			};

			spawnStub.returns(proc);

			const promise = module.promiseSpawn('test', [ 'arg' ], opts);

			assert.isTrue(proc.on.called);
			assert.instanceOf(promise, Promise);
			assert.isTrue(proc.on.calledWith('close'));

			proc.on.lastCall.args[1](0);
			assert.equal(proc, await promise);

			return promise;
		}
	})()
});
