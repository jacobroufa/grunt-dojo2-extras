import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as process from '../../../../src/util/process';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { createStubInstance, stub, SinonStub } from 'sinon';
import { ChildProcess } from 'child_process';

let module: any;
let execStub: SinonStub;
let spawnStub: SinonStub;
let ChildProcessStub: SinonStub;
let ExecOptionsStub: SinonStub;
let SpawnOptionsStub: SinonStub;

registerSuite({
	name: 'util/process',

	before() {
		execStub = stub();
		spawnStub = stub();
		ChildProcessStub = createStubInstance(ChildProcess);
		ExecOptionsStub = stub();
		SpawnOptionsStub = stub();
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		module = loadModule('src/util/process', {
			exec: execStub,
			spawn: spawnStub,
			ChildProcess: ChildProcessStub,
			ExecOptions: ExecOptionsStub,
			SpawnOptions: SpawnOptionsStub
		}, false);
	},

	afterEach() {
		execStub.reset();
		spawnStub.reset();
		ChildProcessStub.reset();
		ExecOptionsStub.reset();
		SpawnOptionsStub.reset();
	},

	async promisify() {
		const proc = execStub()
		process.promisify()
	},
});

