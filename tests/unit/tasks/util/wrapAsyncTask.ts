import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { stub } from 'sinon';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';

const doneStub = stub();
const taskStub = stub();
const loggerStub = { error: stub() };

let wrapAsyncTask: any;

registerSuite({
	name: 'tasks/util/wrapAsyncTask',

	afterEach() {
		doneStub.reset();
		taskStub.reset();
		loggerStub.error.reset();
	},

	beforeEach() {
		wrapAsyncTask = loadModule('tasks/util/wrapAsyncTask', {
			'../../src/log': { logger: loggerStub }
		});
	},

	after() {
		cleanupModuleMocks();
	},

	'task eventually': (() => {
		return {
			'completes'(this: any) {
				const taskPromise = Promise.resolve();
				const callbackAssert = () => {
					assert.isTrue(loggerStub.error.notCalled);
					assert.isTrue(doneStub.calledWithExactly(undefined));
				};

				return runWrapAsyncTaskTest.call(this, taskPromise, callbackAssert);
			},

			'rejects'(this: any) {
				const taskPromise = Promise.reject();
				const errbackAssert = () => {
					assert.isTrue(loggerStub.error.notCalled);
					assert.isTrue(doneStub.calledWithExactly(false));
				};

				return runWrapAsyncTaskTest.call(this, taskPromise, assert.fail, errbackAssert);
			},

			'reject; logs error messages'(this: any) {
				const taskPromise = Promise.reject({ message: 'error message' });
				const errbackAssert = () => {
					assert.isTrue(loggerStub.error.calledWith('error message'));
					assert.isTrue(doneStub.calledWithExactly(false));
				};

				return runWrapAsyncTaskTest.call(this, taskPromise, assert.fail, errbackAssert);
			}
		};

		function runWrapAsyncTaskTest(this: any, promise: Promise<any>, callback: () => void, errback?: () => void) {
			taskStub.returns(promise);

			stub(this, 'async').returns(doneStub);

			wrapAsyncTask(taskStub).call(this);

			this.async.restore();

			// in order to properly assert on this test, the promise has to be resolved initially
			// then passed into wrapAsyncTask and called (so the `then` is chained properly)
			// and THEN we can make the assertion in the callback or errback as appropriate
			return promise.then(callback, errback);

		}
	})()
});
