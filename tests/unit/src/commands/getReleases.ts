import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { stub, SinonStub } from 'sinon';
import { getHtmlApiPath, getJsonApiPath } from '../../../../src/commands/getReleases';
import { Release } from '../../../../src/util/GitHub';

let module: any;
let existsSyncStub: SinonStub;

function assertExistsFilter(builder: any, expected: boolean, filename: string) {
	const filter = builder('project', 'directory');
	existsSyncStub.returns(expected);
	assert.strictEqual(filter({ name: 'version' }), !expected);
	assert.isTrue(existsSyncStub.called, 'existSync was not called');
	assert.strictEqual(existsSyncStub.firstCall.args[0], filename);
}

registerSuite({
	name: 'getReleases',

	before() {
		existsSyncStub = stub();
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		module = loadModule('src/commands/getReleases', {
			fs: {
				existsSync: existsSyncStub
			}
		}, false);
	},

	afterEach() {
		existsSyncStub.reset();
	},

	getHtmlApiPath() {
		assert.strictEqual(getHtmlApiPath('base', 'project', 'version'), 'base/project/version');
	},

	getJsonApiPath() {
		assert.strictEqual(getJsonApiPath('base', 'project', 'version'), 'base/project-version.json');
	},

	filters: {
		createHtmlApiMissingFilter: {
			'exists; returns false'() {
				const { createHtmlApiMissingFilter } = module;
				assertExistsFilter(createHtmlApiMissingFilter, true, 'directory/project/version');
			},

			'does not exist; returns true'() {
				const { createHtmlApiMissingFilter } = module;
				assertExistsFilter(createHtmlApiMissingFilter, false, 'directory/project/version');
			}
		},

		createJsonApiMissingFilter: {
			'exists; returns false'() {
				const { createJsonApiMissingFilter } = module;
				assertExistsFilter(createJsonApiMissingFilter, true, 'directory/project-version.json');
			},

			'does not exist; returns true'() {
				const { createJsonApiMissingFilter } = module;
				assertExistsFilter(createJsonApiMissingFilter, false, 'directory/project-version.json');
			}
		},

		latestFilter() {
			const { latestFilter } = module;
			const list = [ 'one', 'two', 'three' ];
			assert.deepEqual(list.filter(latestFilter), [ 'three' ]);
		},

		createVersionFilter: {
			'satisfies semver; returns true'() {
				const { createVersionFilter } = module;
				const filter = createVersionFilter('>= 2.0.0');
				assert.isTrue(filter({ name: '2.0.0' }));
			},

			'does not satisfy semver; returns false'() {
				const { createVersionFilter } = module;
				const filter = createVersionFilter('< 2.0.0');
				assert.isFalse(filter({ name: '2.0.0' }));
			}
		}
	},

	getReleases: (() => {
		let getReleases: any;
		let mockGitHub: any;

		return {
			before() {
				getReleases = module.default;
				mockGitHub = {
					fetchReleases() {
						return Promise.resolve([
							{ name: 'one' },
							{ name: '2.0.0' },
							{ name: '1.6.5' },
							{ name: '3.0.0-beta' }
						]);
					}
				};
			},

			async 'removes version not compatible with semver'() {
				const releases = await getReleases(mockGitHub);
				const expected = [
					{ name: '1.6.5' },
					{ name: '2.0.0' },
					{ name: '3.0.0-beta' }
				];
				assert.deepEqual(releases, expected);
			},

			async 'applies filters'() {
				const filter = (release: Release) => {
					return release.name === '2.0.0';
				};
				const releases = await getReleases(mockGitHub, [ filter ]);
				const expected = [
					{ name: '2.0.0' }
				];
				assert.deepEqual(releases, expected);
			}
		};
	})()
});
