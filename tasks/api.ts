import IMultiTask = grunt.task.IMultiTask;
import typedoc, { Options as TypedocOptions } from '../src/commands/typedoc';
import wrapAsyncTask from './util/wrapAsyncTask';

export = function (grunt: IGrunt) {
	async function typedocTask(this: IMultiTask<any>) {
		const taskOptions: any = this.options({
			format: 'html'
		});
		const [ owner, repoName ] = taskOptions.repo.split('/');

		const options: TypedocOptions = {
			buildDirectory: taskOptions.buildDirectory,
			apiThemeDirectory: taskOptions.themeDirectory,
			filter: grunt.option<string>('apiversion') || taskOptions.filter,
			format: grunt.option<string>('apiformat') || taskOptions.format,
			owner,
			repoName,
			target: taskOptions.dest
		};

		await typedoc(options);
	}

	grunt.registerMultiTask('api', wrapAsyncTask(typedocTask));
};
