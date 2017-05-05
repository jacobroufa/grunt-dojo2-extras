import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { stub, SinonStub } from 'sinon';
import Git from '../../../../src/util/Git';
import * as env from '../../../../src/util/environment';

let Module: any;
let git: Git;
let promiseSpawnStub: SinonStub;
let promiseExecStub: SinonStub;
let execStub: SinonStub;
let loggerStub: SinonStub;
let existsSyncStub: SinonStub;
let chmodSyncStub: SinonStub;

registerSuite({
	name: 'util/Git',

	before() {
		promiseSpawnStub = stub();
		promiseExecStub = stub();
		execStub = stub();
		loggerStub = stub();
		existsSyncStub = stub();
		chmodSyncStub = stub();
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		Module = loadModule('src/util/Git', {
			'./process': {
				promiseSpawn: promiseSpawnStub,
				promiseExec: promiseExecStub,
				exec: execStub
			},
			'../log': {
				logger: {
					info: loggerStub
				}
			},
			fs: {
				existsSync: existsSyncStub,
				chmodSync: chmodSyncStub
			}
		});

		git = new Module();
	},

	afterEach() {
		promiseSpawnStub.reset();
		promiseExecStub.reset();
		execStub.reset();
		loggerStub.reset();
		existsSyncStub.reset();
		chmodSyncStub.reset();
	},

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
		git.isInitialized = () => false;
		git.assert('url').then(() => assert.fail(), (error: Error) => {
			assert.strictEqual(error.message,
				`Repository is not initialized at "${ git.cloneDirectory }"`);
		});

		git.isInitialized = () => true;
		git.getConfig = stub().withArgs('remote.origin.url')
			.returns('url');

		git.assert('other_url').then(() => assert.fail(), (error: Error) => {
			assert.strictEqual(error.message,
				'Repository mismatch. Expected "url" to be "other_url".');
		});
		assert.doesNotThrow(async () => await git.assert('url'));
	},

	async checkout() {
		promiseExecStub.withArgs('git checkout 1.2.3', {
			silent: false,
			cwd: git.cloneDirectory
		}).returns(Promise.resolve('pass'));

		const actual = git.checkout('1.2.3');

		assert.instanceOf(actual, Promise);
		assert.strictEqual(await actual, 'pass');
	},

	clone: {
		'If clone directory is not set; throws'() {
			delete git.cloneDirectory;
			git.clone('url').then(() => assert.fail(), (error: Error) => {
				assert.equal(error.message,
					'A clone directory must be set');
			});
		},

		// logger should be called once internally and once within execSSHAgent
		async 'Not initialized; logger called 1x, git.url === url'() {
			const url = 'url';
			git.isInitialized = () => false;
			await git.clone(url);
			assert.isTrue(loggerStub.calledTwice);
			assert.strictEqual(git.url, url);
		},

		async 'Properly initialized; logger called 3x, git.url === url'() {
			const url = 'url';
			git.isInitialized = () => true;
			git.assert = stub().withArgs(url)
				.returns(true);
			await git.clone(url);
			assert.isTrue(loggerStub.calledThrice);
			assert.strictEqual(git.url, url);
		}
	},

	async commit() {
		const esa: SinonStub = git.execSSHAgent = stub().returns(Promise.resolve());
		await git.commit('message');
		assert.isTrue(esa.calledOnce);
	},

	createOrphan: {
		'If clone directory is not set; throws'() {
			delete git.cloneDirectory;
			git.createOrphan('branch').then(() => assert.fail(), (error: Error) => {
				assert.equal(error.message,
					'A clone directory must be set');
			});
		},

		async 'promiseExec called twice, logger.info called once'() {
			await git.createOrphan('branch');
			assert.isTrue(promiseExecStub.calledTwice);
			assert.isTrue(loggerStub.calledOnce);
		}
	},

	ensureConfig: {
		async 'hasConfig for user.name, user.email'() {
			git.hasConfig = stub().returns(true);
			const setConfig = git.setConfig = stub();
			await git.ensureConfig();
			assert.isTrue(setConfig.notCalled);
		},

		async '!hasConfig for user.name, user.email; default args set'() {
			git.hasConfig = stub().returns(false);
			const setConfig = git.setConfig = stub();
			await git.ensureConfig();
			assert.isTrue(setConfig.calledWith('user.name', 'Travis CI'));
			assert.isTrue(setConfig.calledWith('user.email', 'support@sitepen.com'));
		},

		async '!hasConfig for user.name, user.email; explicit args set'() {
			git.hasConfig = stub().returns(false);
			const setConfig = git.setConfig = stub();
			await git.ensureConfig('name', 'email');
			assert.isTrue(setConfig.calledWith('user.name', 'name'));
			assert.isTrue(setConfig.calledWith('user.email', 'email'));
		}
	},

	execSSHAgent: {
		async '!hasDeployCredentials; logger, promiseSpawn called'() {
			git.hasDeployCredentials = () => false;
			await git.execSSHAgent('git', [ 'status' ], { silent: false });
			assert.isTrue(loggerStub.calledOnce);
			assert.isTrue(promiseSpawnStub.calledOnce);
		},

		async 'hasDeployCredentials; chmodSync, promiseExec called'() {
			git.hasDeployCredentials = () => true;
			await git.execSSHAgent('git', [ 'status' ], { silent: false });
			assert.isTrue(chmodSyncStub.calledOnce);
			assert.isTrue(promiseExecStub.calledOnce);
		}
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
});
