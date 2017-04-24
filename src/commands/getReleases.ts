import GitHub, { Release } from '../util/GitHub';
import * as semver from 'semver';
import { existsSync } from 'fs';
import { join } from 'path';

export interface ReleaseFilter {
	(release: Release, index: number, array: Release[]): boolean;
}

/**
 * creates a path to HTML API docs
 */
export function getHtmlApiPath(base: string, project: string, version: string) {
	return join(base, `${ project }/${ version }`)
}

/**
 * creates a path to JSON API docs
 */
export function getJsonApiPath(base: string, project: string, version: string) {
	return join(base, `${ project }-${ version }.json`);
}

/**
 * @param project project name
 * @param directory the base directory where html api docs are stored
 * @return a filter for existing html api docs
 */
export function createHtmlApiMissingFilter(project: string, directory: string): ReleaseFilter {
	return (release: Release) => {
		return !existsSync(getHtmlApiPath(directory, project, release.name));
	};
}

/**
 * @param project project name
 * @param directory the base directory where json api docs are stored
 * @return a filter for existing json api docs
 */
export function createJsonApiMissingFilter(project: string, directory: string): ReleaseFilter {
	return (release: Release) => {
		return !existsSync(getJsonApiPath(directory, project, release.name));
	};
}

/**
 * A filters only the latest
 * @param index the index of the release
 * @return if the release is the latest
 */
export function latestFilter(_release: Release, index: number, array: Release[]) {
	return index === array.length - 1;
}

/**
 * @param comp a semver comparison
 * @return a filter to check if the release satisfies the semver
 */
export function createVersionFilter(comp: string): ReleaseFilter {
	return (release: Release) => {
		const version = semver.clean(release.name);
		return semver.satisfies(version, comp);
	};
}

/**
 * Get a list of GitHub releases that pass the supplied filters
 * @param repo the GitHub repository
 * @param filters Release filters to apply to the release
 * @return a list of releases
 */
export default async function getReleases(repo: GitHub, filters: ReleaseFilter[] = []): Promise<Release[]> {
	return (await repo.fetchReleases())
		.filter(function (release) {
			return semver.clean(release.name);
		})
		.sort(function (a: Release, b: Release) {
			const left = semver.clean(a.name);
			const right = semver.clean(b.name);
			return semver.compare(left, right, true);
		})
		.filter(function (release: Release, index: number, array: Release[]) {
			for (const filter of filters) {
				if (!filter(release, index, array)) {
					return false;
				}
			}
			return true;
		});
}
