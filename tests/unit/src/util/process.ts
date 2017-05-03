import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as process from '../../../../src/util/process';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { stub, SinonStub } from 'sinon';

let module: any;
let execChild: SinonStub;
let spawnChild: SinonStub;
let ChildProcess: SinonStub;
let ChildExecOptions: SinonStub;
let ChildSpawnOptions: SinonStub;

registerSuite({
	name: 'util/process',

	before() {
	},

	after() {
	},

	beforeEach() {
	},

	afterEach() {
	}
});

