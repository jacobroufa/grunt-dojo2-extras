import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as environment from 'src/util/environment';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { stub, SinonStub } from 'sinon';

const file = 'test.file';

let mappedEnvs: { name: string; value: string; }[];

let module: any;
let existsSyncStub: SinonStub;

registerSuite({
	name: 'util/environment',

	before() {
		const relevantEnv = [
			'TRAVIS_COMMIT_MESSAGE',
			'TRAVIS_BRANCH',
			'ENCRYPTED_KEY_FILE',
			'TRAVIS_COMMIT',
			'HAS_GIT_CREDENTIALS',
			'HEXO_ROOT',
			'TRAVIS_EVENT_TYPE',
			'KEY_FILE',
			'DEPLOY_DOCS',
			'PUBLISH_TARGET_REPO',
			'TRAVIS_REPO_SLUG'
		];

		mappedEnvs = relevantEnv.map((name) => ({ name, value: process.env[name] }));

		existsSyncStub = stub();
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		module = loadModule('src/util/environment', {
			fs: {
				existsSync: existsSyncStub
			}
		}, false);
	},

	afterEach() {
		mappedEnvs.forEach((val) => {
			if (val.value) {
				process.env[val.name] = val.value;
			} else {
				delete process.env[val.name];
			}
		});

		existsSyncStub.reset();
	},

	commitMessage() {
		const expected = 'update test coverage for `util/environment`';
		process.env.TRAVIS_COMMIT_MESSAGE = expected;
		assert.equal(environment.commitMessage(), expected);
	},

	currentBranch() {
		const expected = 'master';
		process.env.TRAVIS_BRANCH = expected;
		assert.equal(environment.currentBranch(), expected);
	},

	encryptedKeyFile: {
		'returns ENCRYPTED_KEY_FILE'() {
			const filename = 'keyfile';
			const fileWithExt = filename + '.enc';

			delete process.env.KEY_FILE;
			process.env.ENCRYPTED_KEY_FILE = fileWithExt;
			assert.equal(environment.encryptedKeyFile(), fileWithExt);
		},

		'returns value passed'() {
			const filename = 'keyfile';
			const fileWithExt = filename + '.enc';

			delete process.env.ENCRYPTED_KEY_FILE;
			assert.equal(environment.encryptedKeyFile(filename), fileWithExt);
		},

		'returns default encrypted key file'() {
			const keyFileDefault = 'deploy_key.enc';

			delete process.env.ENCRYPTED_KEY_FILE;
			delete process.env.KEY_FILE;
			assert.equal(environment.encryptedKeyFile(), keyFileDefault);
		}
	},

	gitCommit() {
		const hash = 'ad64g9cc';
		process.env.TRAVIS_COMMIT = hash;
		assert.equal(environment.gitCommit(), hash);
	},

	hasGitCredentials: {
		'HAS_GIT_CREDENTIALS set: returns true'() {
			process.env.HAS_GIT_CREDENTIALS = 'true';
			assert.isTrue(module.hasGitCredentials());
		},

		'Running  on Travis; no key file: returns false'() {
			existsSyncStub.returns(false);

			delete process.env.HAS_GIT_CREDENTIALS;
			process.env.TRAVIS_BRANCH = 'master';

			assert.isFalse(module.hasGitCredentials(file));
		},

		'Running on Travis; with key file: returns true'() {
			existsSyncStub.returns(true);

			delete process.env.HAS_GIT_CREDENTIALS;
			process.env.TRAVIS_BRANCH = 'master';

			assert.isTrue(module.hasGitCredentials(file));
			assert.isTrue(existsSyncStub.called);
			assert.strictEqual(existsSyncStub.lastCall.args[0], file);
		},

		'Running locally: returns true'() {
			delete process.env.HAS_GIT_CREDENTIALS;
			delete process.env.TRAVIS_BRANCH;
			assert.isTrue(module.hasGitCredentials());
		}
	},

	hexoRootOverride() {
		const hexoRoot = 'hexoRoot';
		process.env.HEXO_ROOT = hexoRoot;
		assert.equal(environment.hexoRootOverride(), hexoRoot);
	},

	hasKeyFile() {
		assert.isFalse(environment.hasKeyFile(file));
	},

	isCronJob() {
		process.env.TRAVIS_EVENT_TYPE = 'not cron';
		assert.isFalse(environment.isCronJob());
	},

	isRunningOnTravis() {
		delete process.env.TRAVIS_BRANCH;
		assert.isFalse(environment.isRunningOnTravis());
	},

	keyFile: {
		'returns KEY_FILE'() {
			const fileName = 'key_file';
			process.env.KEY_FILE = fileName;
			assert.equal(environment.keyFile(), fileName);
		},

		'returns value passed'() {
			delete process.env.KEY_FILE;
			assert.equal(environment.keyFile(), 'deploy_key');
		}
	},

	publishMode: {
		'returns DEPLOY_DOCS'() {
			const commit = 'commit';
			process.env.DEPLOY_DOCS = commit;
			assert.equal(environment.publishMode(), commit);
		},

		'returns `skip` if running on Travis'() {
			delete process.env.DEPLOY_DOCS;
			process.env.TRAVIS_BRANCH = 'master';
			assert.equal(environment.publishMode(), 'skip');
		}
	},

	repositorySource: {
		'returns PUBLISH_TARGET_REPO if available'() {
			const target = 'target repo';
			process.env.PUBLISH_TARGET_REPO = target;
			assert.equal(environment.repositorySource(), target);
		},

		'returns TRAVIS_REPO_SLUG if PUBLISH_TARGET_REPO unavailable'() {
			delete process.env.PUBLISH_TARGET_REPO;
			const slug = 'target_repo';
			process.env.TRAVIS_REPO_SLUG = slug;
			assert.equal(environment.repositorySource(), slug);
		},

		'returns empty string if TRAVIS_REPO_SLUG and PUBLISH_TARGET_REPO unavailable'() {
			delete process.env.TRAVIS_REPO_SLUG;
			assert.equal(environment.repositorySource(), '');
		}
	}
});
