import IMultiTask = grunt.task.IMultiTask;
import wrapAsyncTask from './util/wrapAsyncTask';
import GitHub from '../src/util/GitHub';
import getGithubSlug from './util/getGithubSlug';
import initDeployment from '../src/commands/initialize/initDeployment';
import initAuthorization from '../src/commands/initialize/initAuthorization';

interface Options {
	password?: string;
	repoName?: string;
	repoOwner?: string;
	username?: string;
}

function getGitHub(task: IMultiTask<any>, grunt: IGrunt) {
	const options = task.options<Options>({
		password: grunt.config.get<string>('github.password'),
		username: grunt.config.get<string>('github.username')
	});
	const { name, owner } = getGithubSlug(options, grunt);
	const repo = new GitHub(owner, name);
	repo.api.authenticate({
		type: 'basic',
		password: options.password,
		username: options.username
	});
	return repo;
}

export = function (grunt: IGrunt) {
	async function setupDeployment(this: IMultiTask<any>) {
		const repo = getGitHub(this, grunt);
		return initDeployment(repo);
	}

	async function setupAuthorization(this: IMultiTask<any>) {
		const repo = getGitHub(this, grunt);
		return initAuthorization(repo);
	}

	grunt.registerMultiTask('setupDeploy', wrapAsyncTask(setupDeployment));
	grunt.registerMultiTask('setupAuth', wrapAsyncTask(setupAuthorization));
};
