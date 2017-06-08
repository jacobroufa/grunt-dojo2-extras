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
		requestStub.post.reset();
		requestStub.get.reset();
	},

	'Travis': {
		beforeEach() {
			travis = new module.default();
		},

		async authenticate() {
			const token = 'token';
			const accessToken = 'access_token';
			const post = requestStub.post;

			post.returns(Promise.resolve({ json: () => Promise.resolve({ 'access_token': accessToken }) }));

			const authenticate = await travis.authenticate(token);

			assert.strictEqual(post.lastCall.args[1].body, '{"github_token":"token"}');
			assert.strictEqual(travis.token, accessToken);
			assert.strictEqual(authenticate, accessToken);
		},

		createAuthorization: (() => {
			let repo: any;
			const tokenAuth = { token: 'token' };

			return {
				beforeEach() {
					repo = {
						createAuthorization: stub().returns(Promise.resolve(tokenAuth)),
						findAuthorization: stub().returns(Promise.resolve())
					};
				},

				afterEach() {
					repo.createAuthorization.reset();
					repo.findAuthorization.reset();
				},

				'existing authorization; eventually throws'() {
					repo.findAuthorization.returns(Promise.resolve({ id: 1 }));

					const promise = travis.createAuthorization(repo);

					return promise.then(assert.fail, (e) => {
						assert.strictEqual(e.message, 'An existing authorization exists. "#1"');
						assert.isTrue(repo.createAuthorization.notCalled);
						assert.isTrue(repo.findAuthorization.calledOnce);
					});
				},

				async 'authentication succeeds'() {
					const auth = stub(travis, 'authenticate').returns(Promise.resolve());
					const deleteAuth = stub(travis, 'deleteAuthorization');

					await travis.createAuthorization(repo);

					assert.isTrue(repo.createAuthorization.calledOnce);
					assert.isTrue(auth.calledOnce);
					assert.isTrue(deleteAuth.notCalled);
					assert.isTrue(travis.isAuthorized());

					auth.restore();
					deleteAuth.restore();
				},

				async 'authentication fails; eventually throws'() {
					const auth = stub(travis, 'authenticate').returns(Promise.reject());
					const deleteAuth = stub(travis, 'deleteAuthorization').returns(Promise.resolve());

					try {
						await travis.createAuthorization(repo);
						assert.fail('Should have thrown');
					} catch (e) {
						// expected to throw
					}

					assert.isTrue(auth.calledOnce);
					assert.isTrue(deleteAuth.calledOnce);

					auth.restore();
					deleteAuth.restore();
				}
			};
		})(),

		deleteAuthorization: (() => {
			let repo: any;

			return {
				beforeEach() {
					repo = {
						deleteAuthorization: stub()
					};
				},

				afterEach() {
					repo.deleteAuthorization.reset();
				},

				async 'not authorized'() {
					await travis.deleteAuthorization(repo);

					assert.isTrue(repo.deleteAuthorization.notCalled);
				},

				async 'authorized'() {
					const create = stub(travis, 'createAuthorization', function(this: any) {
						this.githubAuthorization = { id: 1 };
					}.bind(travis));

					create();
					await travis.deleteAuthorization(repo);

					assert.isTrue(repo.deleteAuthorization.calledOnce);
					assert.isTrue(repo.deleteAuthorization.calledWith(1));

					create.restore();
				}
			};
		})(),

		async fetchRepository() {
			requestStub.get.returns(Promise.resolve({
				json: () => Promise.resolve({
					repo: 'repo'
				})
			}));

			const fetchRepository = await travis.fetchRepository('slug');

			assert.isTrue(requestStub.get.calledOnce);
			assert.instanceOf(fetchRepository, module.Repository);
		},

		isAuthorized: {
			'authorized'() {
				const create = stub(travis, 'createAuthorization', function(this: any) {
					this.githubAuthorization = { id: 1 };
				}.bind(travis));

				create();

				assert.isTrue(travis.isAuthorized());

				create.restore();
			},

			'not authorized'() {
				assert.isFalse(travis.isAuthorized());
			}
		}
	},

	'Repository': (() => {
		const envVarArr = [{
			id: 'id',
			name: 'name',
			value: 'value',
			'public': true,
			repository_id: 1
		}];
		const repo = {
			active: 'active',
			id: 'grunt-dojo2-extras',
			slug: 'extras'
		};
		const token = 'access_token';

		return {
			beforeEach() {
				repository = new module.Repository(token, repo);
			},

			'constructor'() {
				assert.isTrue(repository.active);
				assert.strictEqual(repository.id, repo.id);
				assert.strictEqual(repository.slug, repo.slug);
				assert.strictEqual(repository.token, token);
			},

			async listEnvironmentVariables() {
				requestStub.get.returns(Promise.resolve({
					json: () => Promise.resolve({
						'env_vars': Promise.resolve(envVarArr)
					})
				}));

				const envVars = await repository.listEnvironmentVariables();

				assert.isTrue(requestStub.get.calledOnce);
				assert.strictEqual(envVars, envVarArr);
			},

			setEnvironmentVariables: (() => {
				let envVars: any;

				return {
					beforeEach() {
						envVars = stub(repository, 'listEnvironmentVariables').returns(Promise.resolve(envVarArr));
					},

					afterEach() {
						envVars.restore();
					},

					async 'update existing variable'() {
						requestStub.returns(Promise.resolve({ json: () => {}}));

						await repository.setEnvironmentVariables({
							name: 'name',
							value: 'new value'
						});

						assert.isTrue(requestStub.calledOnce);
					},

					async 'add new environment variable'() {
						requestStub.post.returns(Promise.resolve({ json: () => {}}));

						await repository.setEnvironmentVariables({
							name: 'new name',
							value: 'value'
						});

						assert.isTrue(requestStub.post.calledOnce);
					}
				};
			})()
		};
	})()
});
