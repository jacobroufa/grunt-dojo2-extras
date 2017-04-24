import IMultiTask = grunt.task.IMultiTask;
import typedoc, { Options as TypedocOptions } from '../src/commands/typedoc';
import wrapAsyncTask from './util/wrapAsyncTask';
import GitHub, { Release } from '../src/util/GitHub';
import sync from '../src/commands/sync';
import getReleases, {
	createHtmlApiMissingFilter,
	createJsonApiMissingFilter,
	createVersionFilter,
	getHtmlApiPath,
	getJsonApiPath,
	latestFilter,
	ReleaseFilter
} from '../src/commands/getReleases';

interface BaseOptions {
	dest: string;
	format: TypedocOptions['format'];
	src: string;
	themeDirectory?: TypedocOptions['themeDirectory'];
}

interface RemoteApiOptions extends BaseOptions {
	cloneDirectory: string;
	filter?: ReleaseFilter | ReleaseFilter[] | string;
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

async function getMissing(repo: GitHub, options: TaskOptions): Promise<Release[]> {
	const filters = getFilterOptions(options.filter);

	if (options.format === 'json') {
		filters.push(createJsonApiMissingFilter(repo.name, options.dest));
	}
	else {
		filters.push(createHtmlApiMissingFilter(repo.name, options.dest));
	}

	return getReleases(repo, filters);
}

function getFilterOptions(filter?: RemoteApiOptions['filter']): ReleaseFilter[] {
	if (!filter) {
		return [];
	}
	if (filter === 'latest') {
		return [ latestFilter ];
	}
	if (typeof filter === 'string') {
		return [ createVersionFilter(filter) ];
	}
	if (Array.isArray(filter)) {
		return filter;
	}

	return [ filter ];
}

export = function (grunt: IGrunt) {
	async function typedocTask(this: IMultiTask<any>) {
		const options: any = this.options<Partial<TaskOptions>>({
			format: 'html'
		});
		const { dest, format, themeDirectory } = options;

		if (isRemoteOptions(options)) {
			const { cloneDirectory } = options;
			const repo = getGitHub(options.repo);
			const missing = await getMissing(repo, options);
			const pathTemplate = format === 'json' ? getJsonApiPath : getHtmlApiPath;

			for (const release of missing) {
				const target = pathTemplate(dest, repo.name, release.name);
				const source = cloneDirectory;

				await sync({
					branch: release.name,
					cloneDirectory,
					url: repo.url
				});

				await typedoc({
					themeDirectory,
					format,
					source,
					target
				});
			}
		}
		else {
			await typedoc({
				themeDirectory,
				format,
				source: options.src,
				target: dest
			});
		}
	}

	grunt.registerMultiTask('api', wrapAsyncTask(typedocTask));
};
