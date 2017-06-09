import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { stub } from 'sinon';
import loadModule, { cleanupModuleMocks } from '../../../_support/loadModule';
import { throwWithError } from '../../../_support/util';

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

	before() {
		wrapAsyncTask = loadModule('tasks/util/wrapAsyncTask', {
			'../../src/log': { logger: loggerStub }
		});
	},

	after() {
		cleanupModuleMocks();
	},

	'task eventually': (() => {
		function runWrapAsyncTaskTest(this: any, promise: Promise<any>, callback: () => void, errback?: () => void) {
			taskStub.returns(promise);

			stub(this, 'async').returns(doneStub);

			wrapAsyncTask(taskStub).call(this);

			this.async.restore();

			// wrapAsyncTask performs the logic we're testing after the promise returned by the task it is
			// passed resolves or is rejected. So, in order to verify the results we need to test after the
			// promise is resolved(or rejected). By calling `then()` after wrapAsyncTask we can ensure
			// that the testing callbacks will be executed after the actual callbacks passed to `then` by
			// wrapAsyncTask.
			return promise.then(callback, errback);

		}

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

				return runWrapAsyncTaskTest.call(
					this, taskPromise, throwWithError('Should reject when task fails'), errbackAssert
				);
			},

			'reject; logs error messages'(this: any) {
				const taskPromise = Promise.reject({ message: 'error message' });
				const errbackAssert = () => {
					assert.isTrue(loggerStub.error.calledWith('error message'));
					assert.isTrue(doneStub.calledWithExactly(false));
				};

				return runWrapAsyncTaskTest.call(
					this, taskPromise, throwWithError('Should reject when task fails'), errbackAssert
				);
			}
		};
	})()
});
