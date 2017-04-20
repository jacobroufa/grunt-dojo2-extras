import IMultiTask = grunt.task.IMultiTask;
import sync, { Options as SyncOptions } from '../src/commands/sync';
import wrapAsyncTask from './util/wrapAsyncTask';
import getGithubSlug from './util/getGithubSlug';
import GitHub from '../src/util/GitHub';
import Git from '../src/util/Git';
import { logger } from '../src/log';

/**
 * Resolve the target repository URL using grunt and the state of the environment. Essentially we want to use the
 * ssh+git repository if we think we have credentials and use the https repository otherwise.
 */
async function getRepoUrl(options: any, grunt: IGrunt): Promise<string> {
	if (options.url) {
		return options.url;
	}

	const { name, owner } = getGithubSlug(options, grunt);
	if (name && owner) {
		const repo = new GitHub(owner, name);
		return repo.url;
	}

	logger.info('Repository not explicitly defined. Using current git repository url.');
	const git = new Git();
	return await git.getConfig('remote.origin.url');
}

export = function (grunt: IGrunt) {
	async function syncTask(this: IMultiTask<any>) {
		const options = this.options<any>({});
		options.url = await getRepoUrl(options, grunt);
		await sync(<SyncOptions> options);
	}

	grunt.registerMultiTask('sync', wrapAsyncTask(syncTask));
};
