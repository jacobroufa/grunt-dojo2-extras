import IMultiTask = grunt.task.IMultiTask;
import typedoc, { Options as TypedocOptions } from '../src/commands/typedoc';
import missingApis, { ReleaseFilter } from '../src/commands/missingApis';
import wrapAsyncTask from './util/wrapAsyncTask';
import GitHub from '../src/util/GitHub';
import sync from '../src/commands/sync';

interface BaseOptions {
	dest: string;
	format: TypedocOptions['format'];
	src: string;
	themeDirectory?: TypedocOptions['themeDirectory'];
}

interface RemoteApiOptions extends BaseOptions {
	cloneDirectory: string;
	filter?: ReleaseFilter;
	repo: {
		owner: string;
		name: string;
	} | string;
}

type TaskOptions = Partial<RemoteApiOptions>;

function isRemoteOptions(options: any): options is RemoteApiOptions {
	return !!options.repo && !!options.cloneDirectory;
}

function getGitHub(repo: RemoteApiOptions['repo']) {
	if (typeof repo === 'string') {
		const [ owner, name ] =  repo.split('/');
		return new GitHub(owner, name);
	}
	else {
		return new GitHub(repo.owner, repo.name);
	}
}

export = function (grunt: IGrunt) {
	async function typedocTask(this: IMultiTask<any>) {
		const options: any = this.options<Partial<TaskOptions>>({
			format: 'html'
		});
		const { dest, format, src, themeDirectory } = options;

		if (isRemoteOptions(options)) {
			const { cloneDirectory, filter } = options;
			const repo = getGitHub(options.repo);
			const missing = await missingApis(dest, repo, filter);

			for (const release of missing) {
				await sync({
					branch: release.name,
					cloneDirectory,
					url: repo.url
				});
			}
		}

		await typedoc({
			themeDirectory,
			format,
			source: src,
			target: dest
		});
	}

	grunt.registerMultiTask('api', wrapAsyncTask(typedocTask));
};
