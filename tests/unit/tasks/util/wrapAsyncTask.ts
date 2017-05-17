import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import IMultiTask = grunt.task.IMultiTask;
import * as grunt from 'grunt';
import { stub } from 'sinon';
import { loadTasks, runGruntTask, unloadTasks } from '../../util';
import wrapAsyncTask from 'tasks/util/wrapAsyncTask';

const asyncStub = stub();

async function testTask(grunt: IGrunt) {
	async function testMultiTask(this: IMultiTask<any>) {
		return asyncStub().returns('testMultiTask');
	}

	grunt.registerMultiTask('task', wrapAsyncTask(testMultiTask));
}

registerSuite({
	name: 'tasks/util/wrapAsyncTask',

	setup() {
		grunt.initConfig({
			testTask: {}
		});

		loadTasks();
	},

	teardown() {
		unloadTasks();
	},

	beforeEach() {
		asyncStub.reset();
	},

	'task eventually completes'() {
		runGruntTask('testTask');

		assert.isTrue(asyncStub.calledOnce);

		// const grunt = gruntMock('task');
		// const task = stub().withArgs(grunt).returns(Promise.resolve());
		// const wrappedTask = wrapAsyncTask(task(grunt));

		// // const taskStub: IMultiTask<any> = stub().withArgs('task').returns();
		// // const asyncStub = stub();

		// assert.isFunction(wrappedTask);

		// wrappedTask(grunt);

		// assert.isTrue(asyncStub.calledOnce);
		// assert.isTrue(asyncStub.neverCalledWith(false));
	},

	'task eventually rejects'() {
	}
});

// function gruntMock (this: any, task: any) {
// 	this.task = task;
// 	this.async = asyncStub;

// 	return this;
// }
