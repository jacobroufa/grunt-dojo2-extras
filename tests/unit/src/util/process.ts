import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as process from '../../../../src/util/process';
import { stub } from 'sinon';

registerSuite({
	name: 'util/process',

	async promisify() {
		const proc = {
			on: stub()
		};
		const prom = await process.promisify(proc);
		const closeCallback = proc.on.lastCall.args[1];

		assert.strictEqual(proc.on.lastCall.args[0], 'close');

		closeCallback(0);

		assert.strictEqual(prom, proc);

		closeCallback(1);

		assert.throws(prom);
	}
});
