import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as environment from '../../../../src/util/environment';

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
let mappedEnvs: { name: string; value: string; }[];

registerSuite({
	name: 'util/environment',

	before() {
		mappedEnvs = relevantEnv.map((name) => ({ name, value: process.env[name] }));
	},

	afterEach() {
		mappedEnvs.forEach((val) => process.env[val.name] = val.value);
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

		process.env.ENCRYPTED_KEY_FILE = null;
		process.env.KEY_FILE = null;
		assert.equal(environment.encryptedKeyFile(), keyFileDefault);

		process.env.KEY_FILE = filename;
		assert.equal(environment.encryptedKeyFile(), fileWithExt);

		process.env.KEY_FILE = null;
		process.env.ENCRYPTED_KEY_FILE = fileWithExt;
		assert.equal(environment.encryptedKeyFile(), fileWithExt);

		process.env.ENCRYPTED_KEY_FILE = null;
		assert.equal(environment.encryptedKeyFile(filename), fileWithExt);
	},

	gitCommit() {
		let hash = 'ad64g9cc';
		process.env.TRAVIS_COMMIT = hash;
		assert.equal(environment.gitCommit(), hash);
	}
});
