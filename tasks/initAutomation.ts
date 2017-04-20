import IMultiTask = grunt.task.IMultiTask;
import wrapAsyncTask from './util/wrapAsyncTask';
import GitHub from '../src/util/GitHub';
import getGithubSlug from './util/getGithubSlug';
import initAutomation from '../src/commands/initAutomation';

interface Options {
	password?: string;
	repoName?: string;
	repoOwner?: string;
	username?: string;
}

export = function (grunt: IGrunt) {
	async function initTask(this: IMultiTask<any>) {
		const options = this.options<Options>({
			password: grunt.config.get<string>('github.password'),
			username: grunt.config.get<string>('github.username')
		});
		const { name, owner } = getGithubSlug(options, grunt);
		const repo = new GitHub(owner, name, {
			password: options.password,
			username: options.username
		});
		return initAutomation(repo);
	}

	grunt.registerMultiTask('initAutomation', wrapAsyncTask(initTask));
};
