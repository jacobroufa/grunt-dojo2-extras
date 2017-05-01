import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import Git from 'src/util/Git';
import { tmpDirectory } from '../_support/tmpFiles';

registerSuite({
	name: 'git',

	async build() {
		const out = tmpDirectory();
		const repo = new Git(out);

		assert.isFalse(repo.isInitialized());
	}
});
