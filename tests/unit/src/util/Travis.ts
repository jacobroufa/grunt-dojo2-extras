import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { spy, stub, SinonSpy, SinonStub } from 'sinon';
import Travis, { Repository } from 'src/util/Travis';

let module: any;
let travis: Travis;
let repository: Repository;
let request: any;
let requestSpy: SinonSpy;

registerSuite({
	name: 'util/Travis',

	before() {
		request = class {
			static get: SinonStub = stub();
			static post: SinonStub = stub();
		};
		requestSpy = spy(request);
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		module = loadModule('src/util/Travis', {
			'@dojo/core/request': requestSpy
		}, false);
	},

	afterEach() {
		requestSpy.reset();
	},

	'Travis': {
		beforeEach() {
			travis = new module.default();
		},

		async authenticate() {
			const token = 'token';
			const accessToken = 'access_token';
			const get = request.post;

			get.returns(() => Promise.resolve({ access_token: accessToken }));

			const authenticate = await travis.authenticate(token);

			assert.strictEqual(get.lastCall.args[1].body.github_token, token);
			assert.strictEqual(travis.token, accessToken);
			assert.strictEqual(authenticate, accessToken);
		},

		async createAuthorization() {
		},

		async deleteAuthorization() {
		},

		async fetchRepository() {
		},

		isAuthorized() {
		}
	},

	'Repository': {
		beforeEach() {
			repository = new module.Repository('access_token', {
				active: 'active',
				id: 'grunt-dojo2-extras',
				slug: 'extras'
			});
		},

		'constructor'() {
		},

		async listEnvironmentVariables() {
		},

		async setEnvironmentVariables() {
		}
	}
});
