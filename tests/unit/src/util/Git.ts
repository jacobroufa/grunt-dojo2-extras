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
			'./process': {
				promiseExec: promiseExecStub
			}
		});

		git = new Module();
	},

	afterEach() {
		promiseExecStub.reset();
	},

	Git: (() => {
		return {
			'constructor': {
				'with params'() {
					const gitWithArgs = new Module('dir', 'file');
					assert.equal(gitWithArgs.cloneDirectory, 'dir');
					assert.equal(gitWithArgs.keyFile, 'file');
				},
				'default params'() {
					assert.equal(git.cloneDirectory, process.cwd());
					assert.equal(git.keyFile, env.keyFile());
				}
			},

			async add() {
				promiseExecStub.withArgs('git add file1 file2', {
					silent: false,
					cwd: git.cloneDirectory
				}).returns('pass');

				const actual = git.add('file1', 'file2');

				assert.instanceOf(actual, Promise);
				assert.strictEqual(await actual, 'pass');
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
