import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { spy, stub, SinonSpy, SinonStub } from 'sinon';

let typedoc: any;
let TypedocSpy: SinonSpy;
let dirnameStub: SinonStub;
let expandInputFilesStub: SinonStub;
let extnameStub: SinonStub;
let findConfigFileStub: SinonStub;
let generateDocsStub: SinonStub;
let generateJsonStub: SinonStub;
let mkdirpStub: SinonStub;
let statSyncStub: SinonStub;

registerSuite({
	name: 'commands/typedoc',

	before() {
		dirnameStub = stub();
		expandInputFilesStub = stub();
		extnameStub = stub();
		findConfigFileStub = stub();
		generateDocsStub = stub();
		generateJsonStub = stub();
		mkdirpStub = stub();
		statSyncStub = stub();

		const Typedoc = class {
			bootstrapResult: any = { inputFiles: 'inputFiles' };
			expandInputFiles: SinonStub = expandInputFilesStub;
			generateDocs(project: any, out: any) {
				return generateDocsStub(project, out);
			}
			generateJson(project: any, out: any) {
				return generateJsonStub(project, out);
			}
		};

		TypedocSpy = spy(Typedoc);
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		typedoc = loadModule('src/commands/typedoc', {
			'path': {
				dirname: dirnameStub,
				extname: extnameStub
			},
			'mkdirp': {
				sync: mkdirpStub
			},
			'typedoc': {
				Application: TypedocSpy
			},
			'fs': {
				statSync: statSyncStub
			},
			'typescript': {
				findConfigFile: findConfigFileStub
			}
		});
	},

	afterEach() {
		dirnameStub.reset();
		expandInputFilesStub.reset();
		extnameStub.reset();
		findConfigFileStub.reset();
		generateDocsStub.reset();
		generateJsonStub.reset();
		mkdirpStub.reset();
		statSyncStub.reset();
		TypedocSpy.reset();
	},

	'typedoc': (() => {
		return {
			async 'opts.tsconfig is true'() {
				findConfigFileStub.returns('tsconfig');

				await assertTypedoc('source', 'target', { tsconfig: true });

				assert.isTrue(findConfigFileStub.calledOnce);
			},

			async 'opts.tsconfig is false'() {
				const isDirectoryStub = stub();

				statSyncStub.returns({ isDirectory: isDirectoryStub });

				await assertTypedoc('source', 'target', { tsconfig: false });

				assert.isTrue(isDirectoryStub.calledOnce);
			},

			async 'target is JSON'() {
				extnameStub.returns('.json');

				await assertTypedoc('source', 'target.json', { tsconfig: true });

				assert.isTrue(dirnameStub.calledOnce);
				assert.isTrue(generateJsonStub.calledOnce);
			},

			async 'target is not JSON'() {
				extnameStub.returns('.file');

				await assertTypedoc('source', 'target.file', { tsconfig: true });

				assert.isTrue(generateDocsStub.calledOnce);
			}
		};

		async function assertTypedoc(source: string, target: string, opts: any) {
			await typedoc(source, target, opts);

			assert.isTrue(TypedocSpy.calledOnce);
			assert.isTrue(expandInputFilesStub.calledOnce);
			assert.isTrue(extnameStub.calledOnce);
			assert.isTrue(mkdirpStub.calledOnce);
		}
	})()
});
