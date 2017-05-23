import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import typedoc from 'src/commands/typedoc';
import { tmpDirectory } from '../_support/tmpFiles';
import { readFileSync } from 'fs';
import { join } from 'path';

let sampleRequire: any;
let outputTarget: any;

registerSuite({
	name: 'typedoc',

	before() {
		sampleRequire = (<any> require).toUrl('assets/sample');
	},

	beforeEach() {
		outputTarget = tmpDirectory();
	},

	async build() {
		await typedoc(sampleRequire, outputTarget);

		const indexFile = readFileSync(join(outputTarget, 'index.html'));

		assert.include(String(indexFile), 'This is a README!');
	},

	async 'build JSON'() {
		let json;

		outputTarget = tmpDirectory('.json');

		await typedoc(sampleRequire, outputTarget);

		const indexFile = readFileSync(outputTarget);

		try {
			json = JSON.parse(String(indexFile));
		} catch (e) {
			console.log(e.message);
			assert.fail('typedoc output should be a JSON object');
		}
	},

	async 'test externalPattern and excludeExternals options'() {
		const opts = {
			excludeExternals: true,
			externalPattern: '**/examples/**/*.ts'
		};

		await typedoc(sampleRequire, outputTarget, opts);


	},

	// async excludeOption() {
	// 	const opts = {
	// 	};

	// 	await typedoc(sampleRequire, outputTarget, opts);
	// },

	async 'test includeDeclarations option'() {
		const opts = {
			includeDeclarations: true
		};

		await typedoc(sampleRequire, outputTarget, opts);
	}
});
