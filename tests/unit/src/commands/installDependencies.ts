import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { stub, SinonStub } from 'sinon';

let installDependencies: any;
let joinStub: SinonStub;
let execStub: SinonStub;
let existsSyncStub: SinonStub;

registerSuite({
	name: 'commands/installDependencies',

	before() {
		joinStub = stub();
		execStub = stub();
		existsSyncStub = stub();
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		installDependencies = loadModule('src/commands/installDependencies', {
			'path': {
				join: joinStub
			},
			'../util/process': {
				exec: execStub
			},
			'fs': {
				existsSync: existsSyncStub
			}
		});
	},

	afterEach() {
		joinStub.reset();
		execStub.reset();
		existsSyncStub.reset();
	},

	installDependencies: (() => {
		const dir = 'dir';
		const typingsJsonDir = 'dir/typings.json';

		return {
			async 'typings.json exists'() {
				existsSyncStub.returns(true);

				await assertInstallDependencies(dir);

				assert.isTrue(execStub.calledTwice);
				assert.strictEqual(execStub.secondCall.args[1].cwd, dir);
			},

			async 'typings.json does not exist'() {
				existsSyncStub.returns(false);

				await assertInstallDependencies(dir);

				assert.isTrue(execStub.calledOnce);
			}
		};

		async function assertInstallDependencies(dir: string) {
			joinStub.returns(typingsJsonDir);

			const typingsJson = await installDependencies(dir);

			assert.strictEqual(typingsJson, typingsJsonDir);
			assert.isTrue(joinStub.calledOnce);
			assert.strictEqual(joinStub.firstCall.args[0], dir);
			assert.strictEqual(execStub.firstCall.args[1].cwd, dir);

			return typingsJson;
		}
	})()
});
