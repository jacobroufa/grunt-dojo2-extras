import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { spy, stub, SinonStub } from 'sinon';
import Git from 'src/util/Git';
import * as env from 'src/util/environment';

let Module: any;
let git: Git;
let promiseSpawnStub: SinonStub;
let promiseExecStub: SinonStub;
let execStub: SinonStub;
let toStringStub: SinonStub;
let existsSyncStub: SinonStub;
let chmodSyncStub: SinonStub;

registerSuite({
	name: 'util/Git',

	before() {
		promiseSpawnStub = stub();
		promiseExecStub = stub();
		execStub = stub();
		toStringStub = stub();
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
			'./streams': {
				toString: toStringStub
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
		toStringStub.reset();
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
		assert.doesNotThrow(() => git.assert('url'));
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
		'If clone directory is not set; eventually rejects'() {
			delete git.cloneDirectory;
			git.clone('url').then(() => assert.fail(), (error: Error) => {
				assert.equal(error.message,
					'A clone directory must be set');
			});
		},

		async 'Not initialized; assert not called, execSSHAgent called once, git.url === url'() {
			const url = 'url';
			const assertSpy = spy(git, 'assert');
			const execSSHAgentStub = stub(git, 'execSSHAgent').returns(Promise.resolve());
			git.isInitialized = () => false;
			await git.clone(url);
			assert.isTrue(assertSpy.notCalled);
			assert.isTrue(execSSHAgentStub.called);
			assert.strictEqual(git.url, url);
		},

		async 'Properly initialized; assert called once, execSSHAgent called once, git.url === url'() {
			const url = 'url';
			const assertStub = stub(git, 'assert');
			const execSSHAgentStub = stub(git, 'execSSHAgent').returns(Promise.resolve());
			git.isInitialized = () => true;
			await git.clone(url);
			assert.isTrue(assertStub.called);
			assert.isTrue(execSSHAgentStub.called);
			assert.strictEqual(git.url, url);
		}
	},

	async commit() {
		const execSSHAgent = stub(git, 'execSSHAgent').returns(Promise.resolve());
		await git.commit('message');
		assert.isTrue(execSSHAgent.calledOnce);
		assert.isTrue(execSSHAgent.calledWith('git', ['commit', '-m', '"message"'], { silent: false, cwd: git.cloneDirectory }));
	},

	createOrphan: {
		'If clone directory is not set; throws'() {
			delete git.cloneDirectory;
			git.createOrphan('branch').then(() => assert.fail(), (error: Error) => {
				assert.equal(error.message,
					'A clone directory must be set');
			});
		},

		async 'promiseExec called twice with proper options'() {
			const execOptions = { silent: true, cwd: git.cloneDirectory };
			await git.createOrphan('branch');
			assert.isTrue(promiseExecStub.calledTwice);
			assert.isTrue(promiseExecStub.calledWith('git checkout --orphan branch', execOptions));
			assert.isTrue(promiseExecStub.calledWith('git rm -rf .', execOptions));
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
		async '!hasDeployCredentials; promiseSpawn called'() {
			const command = 'git';
			const args = [ 'status' ];
			const opts = { silent: false };
			git.hasDeployCredentials = () => false;
			await git.execSSHAgent(command, args, opts);
			assert.isTrue(promiseSpawnStub.calledOnce);
			assert.isTrue(promiseSpawnStub.calledWith(command, args, opts));
		},

		async 'hasDeployCredentials; chmodSync, promiseExec called'() {
			const command = 'git';
			const args = [ 'status' ];
			const opts = { silent: false };
			git.keyFile = 'key.file';
			git.hasDeployCredentials = () => true;
			await git.execSSHAgent(command, args, opts);
			assert.isTrue(chmodSyncStub.calledOnce);
			assert.isTrue(promiseExecStub.calledOnce);
			assert.isTrue(promiseExecStub.calledWith(`ssh-agent bash -c 'ssh-add key.file; git status'`, opts));
		}
	},

	async getConfig() {
		execStub.withArgs('git config key', {
			silent: true,
			cwd: git.cloneDirectory
		}).returns({ stdout: 'key' });
		toStringStub.withArgs('key').returns('key');

		const keyConfig = await git.getConfig('key');

		assert.isTrue(execStub.calledOnce);
		assert.isTrue(toStringStub.calledOnce);
		assert.strictEqual(keyConfig, 'key');
	},

	areFilesChanged: {
		beforeEach() {
			execStub.withArgs('git status --porcelain', {
				silent: true,
				cwd: git.cloneDirectory
			});
		},
		async 'exec and toString each called once'() {
			execStub.returns({ stdout: '' });
			toStringStub.returns('');

			await git.areFilesChanged();

			assert.isTrue(execStub.calledOnce);
			assert.isTrue(toStringStub.calledOnce);
		},
		async 'files are changed; returns true'() {
			execStub.returns({ stdout: 'changed' });
			toStringStub.withArgs('changed').returns('changed');

			const changed = await git.areFilesChanged();

			assert.isTrue(changed);
		},
		async 'files are not changed; returns false'() {
			execStub.returns({ stdout: '' });
			toStringStub.withArgs('').returns('');

			const changed = await git.areFilesChanged();

			assert.isFalse(changed);
		}
	},

	hasConfig: {
		async 'has a configuration value'() {
			git.getConfig = async () => 'config';
			const hasConfig = await git.hasConfig('config');
			assert.isTrue(hasConfig);
		},
		async 'has no configuration value'() {
			git.getConfig = async () => '';
			const hasConfig = await git.hasConfig('config');
			assert.isFalse(hasConfig);
		}
	},

	hasDeployCredentials() {
		const exists = existsSyncStub.withArgs(git.keyFile);

		exists.returns(true);
		assert.isTrue(git.hasDeployCredentials());

		exists.returns(false);
		assert.isFalse(git.hasDeployCredentials());
	},

	async headRevision() {
		const hash = '505b86ca8feb5295789720ef9d56cf016c217b0e';

		execStub.withArgs('git rev-parse HEAD', {
			silent: false,
			cwd: git.cloneDirectory
		}).returns({ stdout: hash });
		toStringStub.withArgs(hash)
			.returns(hash);

		const revision = await git.headRevision();

		assert.isTrue(execStub.calledOnce);
		assert.isTrue(toStringStub.calledOnce);

		assert.strictEqual(revision, hash);
	},

	isInitialized: {
		'throws error if there is no cloneDirectory'() {
			git.cloneDirectory = undefined;
			assert.throws(git.isInitialized);

			try {
				git.isInitialized();
			} catch (e) {
				assert.strictEqual(e.message, 'A clone directory must be set');
			}
		},
		'cloneDirectory exists but not counterpart .git directory; returns false'() {
			existsSyncStub.returns(false);
			existsSyncStub.withArgs(git.cloneDirectory).returns(true);
			assert.isFalse(git.isInitialized());
		},
		'cloneDirectory and .git directory exist; returns true'() {
			existsSyncStub.returns(true);
			assert.isTrue(git.isInitialized());
		}
	},

	pull() {
		const execSSHAgentStub = git.execSSHAgent = stub();

		git.pull('origin', 'master');
		assert.isTrue(execSSHAgentStub.calledWith('git', [ 'pull', 'origin', 'master' ], { cwd: git.cloneDirectory }));

		git.pull();
		assert.isTrue(execSSHAgentStub.calledWith('git', [ 'pull' ], { cwd: git.cloneDirectory }));
	},

	push() {
		const execSSHAgentStub = git.execSSHAgent = stub();

		git.push('master', 'origin');
		assert.isTrue(execSSHAgentStub.calledWith('git', [ 'push', 'origin', 'master' ], { silent: false, cwd: git.cloneDirectory }));

		git.push();
		assert.isTrue(execSSHAgentStub.calledWith('git', [ 'push' ], { silent: false, cwd: git.cloneDirectory }));
	},

	setConfig() {
		git.setConfig('key', 'value');
		assert.isTrue(promiseExecStub.calledWith('git config --global key value', { silent: false }));
	}
});
