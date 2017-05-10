import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { stub, SinonStub } from 'sinon';
import Travis, { Repository } from 'src/util/Travis';

let module: any;
let travis: Travis;
let repository: Repository;
let requestStub: SinonStub & Partial<{ get: SinonStub, post: SinonStub }>;

registerSuite({
	name: 'util/Travis',

	before() {
		requestStub = stub();
		requestStub.post = stub();
		requestStub.get = stub();
	},

	after() {
		cleanupModuleMocks();
	},

	beforeEach() {
		module = loadModule('src/util/Travis', {
			'@dojo/core/request': { default: requestStub }
		}, false);
	},

	afterEach() {
		requestStub.reset();
	},

	'Travis': {
		beforeEach() {
			travis = new module.default();
		},

		async authenticate() {
			const token = 'token';
			const accessToken = 'access_token';
			const post = requestStub.post;

			post.returns(Promise.resolve({ json: () => Promise.resolve({ accessToken }) }));

			const authenticate = await travis.authenticate(token);

			assert.strictEqual(post.lastCall.args[1].body, '{"github_token":"token"}');
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
