import GitHub, { Release } from '../util/GitHub';
import { join } from 'path';
import { existsSync } from 'fs';
import * as semver from 'semver';

export interface ReleaseFilter {
	(release: Release): boolean;
}

function noopFilter() {
	return true;
}

export default async function missingApis(directory: string, repo: GitHub, filter?: ReleaseFilter | string): Promise<Release[]> {
	const releases = (await repo.fetchReleases())
		.filter(function (release) {
			return semver.clean(release.name);
		}).sort(function (a: Release, b: Release) {
			const left = semver.clean(a.name);
			const right = semver.clean(b.name);
			return semver.compare(left, right, true);
		});

	let filterMethod: ReleaseFilter = noopFilter;
	if (filter === 'latest') {
		return releases.slice(-1);
	}
	else if (typeof filter === 'string') {
		filterMethod = function (release: Release) {
			const version = semver.clean(release.name);
			return semver.satisfies(version, filter);
		};
	}

	return releases.filter(function (release: Release) {
		const path = join(directory, release.name);
		return filterMethod(release) && !existsSync(path);
	});
}
