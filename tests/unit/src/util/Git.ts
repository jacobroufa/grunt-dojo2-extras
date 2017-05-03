import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import Git from '../../../../src/util/Git';
import * as env from '../../../../src/util/environment';

registerSuite({
	name: 'util/Git',

	before() {
	},

	after() {
	},

	Git: (() => {
		const git = new Git();

		return {
			'default params'() {
				assert.equal(git.cloneDirectory, process.cwd());
				assert.equal(git.keyFile, env.keyFile());
			},

			async add() {
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
