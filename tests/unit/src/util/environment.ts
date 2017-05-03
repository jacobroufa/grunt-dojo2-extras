import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as environment from '../../../../src/util/environment';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { stub, SinonStub } from 'sinon';

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
const file = 'test.file';

let mappedEnvs: { name: string; value: string; }[];

let module: any;
let appendFileSyncStub: SinonStub;
let existsSyncStub: SinonStub;

registerSuite({
	name: 'util/environment',

	before() {
		mappedEnvs = relevantEnv.map((name) => ({ name, value: process.env[name] }));

		appendFileSyncStub = stub();
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
		let commit = 'update test coverage for `util/environment`';
		process.env.TRAVIS_COMMIT_MESSAGE = commit;
		assert.equal(environment.commitMessage(), commit);
	},

	currentBranch() {
		let branch = 'master';
		process.env.TRAVIS_BRANCH = branch;
		assert.equal(environment.currentBranch(), branch);
	},

	decryptIvName() {
		assert.equal(environment.decryptIvName(), 'publish_deploy_iv');
	},

	decryptKeyName() {
		assert.equal(environment.decryptKeyName(), 'publish_deploy_key');
	},

	encryptedKeyFile() {
		let filename = 'keyfile';
		let fileWithExt = filename + '.enc';
		let keyFileDefault = 'deploy_key.enc';

		delete process.env.ENCRYPTED_KEY_FILE;
		delete process.env.KEY_FILE;
		assert.equal(environment.encryptedKeyFile(), keyFileDefault);

		process.env.KEY_FILE = filename;
		assert.equal(environment.encryptedKeyFile(), fileWithExt);

		delete process.env.KEY_FILE;
		process.env.ENCRYPTED_KEY_FILE = fileWithExt;
		assert.equal(environment.encryptedKeyFile(), fileWithExt);

		delete process.env.ENCRYPTED_KEY_FILE;
		assert.equal(environment.encryptedKeyFile(filename), fileWithExt);
	},

	gitCommit() {
		let hash = 'ad64g9cc';
		process.env.TRAVIS_COMMIT = hash;
		assert.equal(environment.gitCommit(), hash);
	},

	hasGitCredentials() {
		process.env.HAS_GIT_CREDENTIALS = 'true';
		assert.isTrue(environment.hasGitCredentials());

		delete process.env.TRAVIS_BRANCH;
		delete process.env.HAS_GIT_CREDENTIALS;
		assert.isTrue(environment.hasGitCredentials());

		process.env.TRAVIS_BRANCH = 'master';
		assert.isFalse(environment.hasGitCredentials(file));

		appendFileSyncStub(file, 'git credentials');
		assert.isTrue(environment.hasGitCredentials(file));
	},

	hexoRootOverride() {
		let hexoRoot = 'hexoRoot';
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

	keyFile() {
		let fileName = 'key_file';
		process.env.KEY_FILE = fileName;
		assert.equal(environment.keyFile(), fileName);

		delete process.env.KEY_FILE;
		assert.equal(environment.keyFile(), 'deploy_key');
	},

	publishMode() {
		let commit = 'commit';
		process.env.DEPLOY_DOCS = commit;
		assert.equal(environment.publishMode(), commit);

		delete process.env.DEPLOY_DOCS;
		process.env.TRAVIS_BRANCH = 'master';
		assert.equal(environment.publishMode(), 'skip');
	},

	repositorySource() {
		let target = 'target repo';
		process.env.PUBLISH_TARGET_REPO = target;
		assert.equal(environment.repositorySource(), target);

		delete process.env.PUBLISH_TARGET_REPO;
		let slug = 'target_repo';
		process.env.TRAVIS_REPO_SLUG = slug;
		assert.equal(environment.repositorySource(), slug);

		delete process.env.TRAVIS_REPO_SLUG;
		assert.equal(environment.repositorySource(), '');
	}
});
