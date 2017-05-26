import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import typedoc from 'src/commands/typedoc';
import { tmpDirectory } from '../_support/tmpFiles';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

let sampleRequire: any;
let outputTarget: any;

function getTreeContents(obj: any, path: string) {
	const itemPath = join(obj.currentPath, path);
	console.log(arguments[1], arguments[3]);
	if (path.split('.').length > 1) {
		console.log(path, ' is a file');
		obj[path] = String(readFileSync(itemPath));
	} else if (['assets'].some((p) => p === path)) {
		console.log(path, ' should not be dealt with');
	} else {
		console.log(path, ' is a dir');
		obj[path] = readdirSync(itemPath).reduce(getTreeContents, {
			currentPath: join(obj.currentPath, path)
		});
	}

	return obj;
}

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
			assert.isOk(json.children);
		} catch (e) {
			console.log(e.message);
			assert.fail('typedoc output should be a JSON object');
		}
	},

	async 'test externalPattern option'() {
		const opts = {
			externalPattern: '**/examples/**/*.ts'
		};

		outputTarget = tmpDirectory('.json');

		await typedoc(sampleRequire, outputTarget, opts);

		const output = JSON.parse(String(readFileSync(outputTarget)));

		// we should have two children, index and excluded/excluded
		assert.strictEqual(output.children.length, 2);

		const outputChildNames = output.children.map((child: any) => child.name);

		assert.include(outputChildNames, '"index"');
		assert.include(outputChildNames, '"excluded/excluded"');

		const excludedChild = output.children.filter((child: any) => child.flags.isExternal);

		assert.strictEqual(excludedChild[0].name, '"excluded/excluded"');
	},

	async 'test excludeExternals option'() {
		const opts = {
			excludeExternals: true,
			externalPattern: '**/examples/**/*.ts'
		};

		outputTarget = tmpDirectory('.json');

		await typedoc(sampleRequire, outputTarget, opts);

		const output = JSON.parse(String(readFileSync(outputTarget)));

		// index.ts should be the only child
		assert.strictEqual(output.children.length, 1);
		assert.strictEqual(output.children[0].name, '"index"');
		assert.isUndefined(output.children[0].flags.isExternal);
	},

	async excludeOption() {
		const opts = {
			exclude: '**/index.ts'
		};

		outputTarget = tmpDirectory('.json');

		await typedoc(sampleRequire, outputTarget, opts);

		const output = JSON.parse(String(readFileSync(outputTarget)));

		// we should have no children
		assert.isUndefined(output.children);
	},

	async 'test includeDeclarations option'() {
		const opts = {
			includeDeclarations: true
		};

		outputTarget = tmpDirectory('.json');

		await typedoc(sampleRequire, outputTarget, opts);

		const output = JSON.parse(String(readFileSync(outputTarget)));

		// if we includeDeclarations, it should pull in .d.ts files from the whole project
		assert.isTrue(output.children.length > 2);
	}
});
