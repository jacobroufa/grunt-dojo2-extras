import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as grunt from 'grunt';
import { loadTasks, unloadTasks, runGruntTask } from '../../_support/loadGrunt';
import { stub, spy, SinonSpy } from 'sinon';

let GitHub: any;
let GitHubSpy: SinonSpy;

const typedocStub = stub();
const syncStub = stub();
const getReleasesStub = stub();
const createHtmlApiMissingFilterStub = stub();
const createJsonApiMissingFilterStub = stub();
const createVersionFilterStub = stub();
const getHtmlApiPathStub = stub();
const getJsonApiPathStub = stub();
const latestFilterStub = stub();
const joinStub = stub();
const resolveStub = stub();
const installDependenciesStub = stub();
const makeTempDirectoryStub = stub();

registerSuite({
	name: 'tasks/api',

	setup() {
		grunt.initConfig({
			api: {
				options: {
					format: 'html',
					typedoc: {
						mode: 'file',
						excludeExternals: true,
						excludeNotExported: true,
						ignoreCompilerErrors: true
					}
				},
				html: {
					options: {
						dest: '<%= apiDirectory %>',
						src: '.'
					}
				},
				json: {
					options: {
						format: 'json',
						dest: '<%= apiDirectory %>/api.json',
						src: '.'
					}
				}
			}
		});

		GitHub = class {
			name: string;
			url: string;
			constructor(owner: any, name: any) {
				this.name = name;
				this.url = `https://github.com/${owner}/${name}`;
				return this;
			}
		};

		GitHubSpy = spy(GitHub);

		loadTasks({
			'../src/commands/typedoc': { default: typedocStub },
			'../src/util/GitHub': { default: GitHubSpy },
			'../src/commands/sync': { default: syncStub },
			'../src/commands/getReleases': {
				default: getReleasesStub,
				createHtmlApiMissingFilter: createHtmlApiMissingFilterStub,
				createJsonApiMissingFilter: createJsonApiMissingFilterStub,
				createVersionFilter: createVersionFilterStub,
				getHtmlApiPath: getHtmlApiPathStub,
				getJsonApiPath: getJsonApiPathStub,
				latestFilter: latestFilterStub
			},
			'path': {
				join: joinStub,
				resolve: resolveStub
			},
			'../src/commands/installDependencies': { default: installDependenciesStub },
			'../src/util/file': { makeTempDirectory: makeTempDirectoryStub }
		});
	},

	teardown() {
		unloadTasks();
	},

	afterEach() {
		typedocStub.reset();
		GitHubSpy.reset();
		syncStub.reset();
		getReleasesStub.reset();
		createHtmlApiMissingFilterStub.reset();
		createJsonApiMissingFilterStub.reset();
		createVersionFilterStub.reset();
		getHtmlApiPathStub.reset();
		getJsonApiPathStub.reset();
		latestFilterStub.reset();
		joinStub.reset();
		resolveStub.reset();
		installDependenciesStub.reset();
		makeTempDirectoryStub.reset();
	},

	'api task has remote options; eventually resolves'(this: any) {
		const dfd = this.async();

		runGruntTask('api', dfd.callback((result: any) => {
			assert.isUndefined(result);
		}));
	},

	'api task has remote options; no APIs match the filter; eventually resolves'(this: any) {
		const dfd = this.async();

		runGruntTask('api', dfd.callback((result: any) => {
			assert.isUndefined(result);
		}));
	},

	'api task has remote options; all APIs are up to date; eventually resolves'(this: any) {
		const dfd = this.async();

		runGruntTask('api', dfd.callback((result: any) => {
			assert.isUndefined(result);
		}));
	},

	'api task has remote options; runs installDependencies; eventually resolves'(this: any) {
		const dfd = this.async();

		runGruntTask('api', dfd.callback((result: any) => {
			assert.isUndefined(result);
		}));
	},

	'api task has no remote options; eventually resolves'(this: any) {
		const dfd = this.async();

		runGruntTask('api', dfd.callback((result: any) => {
			assert.isUndefined(result);
		}));
	},

	'api task has no remote options; runs installDependencies; eventually resolves'(this: any) {
		const dfd = this.async();

		runGruntTask('api', dfd.callback((result: any) => {
			assert.isUndefined(result);
		}));
	}
});
