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
import { join, resolve } from 'path';
import { mkdtempSync } from 'fs';
import installDependencies from '../src/commands/installDependencies';
import { logger } from '../src/log';

interface BaseOptions {
	dest: string;
	format: 'html' | 'json';
	skipInstall: boolean;
	src: string;
	typedoc?: Partial<TypedocOptions>;
}

interface RemoteApiOptions extends BaseOptions {
	cloneDirectory?: string;
	filter?: ReleaseFilter | ReleaseFilter[] | string;
	repo: {
		owner: string;
		name: string;
	} | string;
}

type TaskOptions = BaseOptions | RemoteApiOptions;

function isRemoteOptions(options: any): options is RemoteApiOptions {
	return !!options.repo;
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

async function getMissing(repo: GitHub, options: RemoteApiOptions): Promise<Release[]> {
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

function createTempDirectory(name: string = ''): string {
	return mkdtempSync(join('.sync', name));
}

export = function (grunt: IGrunt) {
	async function typedocTask(this: IMultiTask<any>) {
		const options: any = this.options<Partial<TaskOptions>>({
			format: 'html',
			typedoc: {
				mode: 'file',
				externalPattern: '**/+(example|examples|node_modules|tests|typings)/**/*.ts',
				excludeExternals: true,
				excludeNotExported: true,
				ignoreCompilerErrors: true
			}
		});

		const { src, dest, format } = options;

		if (isRemoteOptions(options)) {
			const repo = getGitHub(options.repo);
			const cloneDirectory = options.cloneDirectory ? options.cloneDirectory : createTempDirectory(repo.name);
			const missing = await getMissing(repo, options);
			const pathTemplate = format === 'json' ? getJsonApiPath : getHtmlApiPath;

			if (missing.length === 0) {
				if (options.filter) {
					logger.info(`No APIs match the filter: "${ options.filter }`);
				}
				else {
					logger.info(`all APIs are up-to-date.`);
				}
				return;
			}

			for (const release of missing) {
				const target = pathTemplate(dest, repo.name, release.name);

				await sync({
					branch: release.name,
					cloneDirectory,
					url: repo.url
				});

				if (options.skipInstall !== true) {
					await installDependencies(cloneDirectory);
				}
				await typedoc(cloneDirectory, target, options.typedoc);
			}
		}
		else {
			if (options.skipInstall === false) {
				await installDependencies(src);
			}
			await typedoc(resolve(src), dest, options.typedoc);
		}
	}

	grunt.registerMultiTask('api', wrapAsyncTask(typedocTask));
};
