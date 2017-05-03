import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { stub, SinonStub } from 'sinon';
import Git from '../../../../src/util/Git';
import * as env from '../../../../src/util/environment';

let Module: any;
let git: Git;
let promiseExecStub: SinonStub;

registerSuite({
	name: 'util/Git',

	before() {
		promiseExecStub = stub();
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		Module = loadModule('src/util/Git', {
			promiseExec: promiseExecStub
		}, false);

		git = new Module();
	},

	afterEach() {
		promiseExecStub.reset();
	},

	Git: (() => {
		return {
			'default params'() {
				assert.equal(git.cloneDirectory, process.cwd());
				assert.equal(git.keyFile, env.keyFile());
			},

			async add() {
				promiseExecStub.withArgs('git add file1 file2', {
					silent: false,
					cwd: git.cloneDirectory
				}).returns(Promise);
				assert.isTrue(git.add('file1', 'file2') instanceof Promise);
			},

			async assert() {
			},

			checkout() {
			},

			async clone() {
			},

			async commit() {
			},

			async createOrphan() {
			},

			async ensureConfig() {
			},

			execSSHAgent() {
			},

			async getConfig() {
			},

			async areFilesChanged() {
			},

			async hasConfig() {
			},

			hasDeployCredentials() {
			},

			async headRevision() {
			},

			isInitialized() {
			},

			pull() {
			},

			push() {
			},

			setConfig() {
			}
		};
	})()
});
