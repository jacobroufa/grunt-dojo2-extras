import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { makeTempDirectory } from 'src/util/file';
import { existsSync, statSync } from 'fs';

registerSuite({
	name: 'file',

	tempDirectory() {
		const path = makeTempDirectory('./test');
		assert.isTrue(existsSync(path));
		assert.isTrue(statSync(path).isDirectory());
	}
});
