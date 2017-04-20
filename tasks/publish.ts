import IMultiTask = grunt.task.IMultiTask;
import publish from '../src/commands/publish';
import Git from '../src/util/Git';
import wrapAsyncTask from './util/wrapAsyncTask';
import { hasGitCredentials, publishMode } from '../src/util/environment';

export = function (grunt: IGrunt) {
	async function publishTask(this: IMultiTask<any>) {
		const options = this.options<any>({
			publishMode() {
				if (hasGitCredentials()) {
					return publishMode();
				}

				return 'skip';
			}
		});

		const publishModeCli = grunt.option<string>('publishmode');
		if (publishModeCli) {
			options.publishMode = publishModeCli;
		}
		options.repo = new Git(options.cloneDirectory);

		await publish(options);
	}

	grunt.registerMultiTask('publish', wrapAsyncTask(publishTask));
};
