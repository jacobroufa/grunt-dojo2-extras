import Git from '../util/Git';
import { logger } from '../log';
import { existsSync } from 'fs';

export interface Options {
	branch: string;
	cloneDirectory: string;
	url: string;
	username?: string;
	useremail?: string;
}

export async function assertUrl(url: string, git: Git) {
	const remoteUrl = await git.getConfig('remote.origin.url');
	if (url !== remoteUrl) {
		throw new Error(`Existing repository url "${ remoteUrl }" is different from requested "${ url }"`);
	}
}

export default async function sync(options: Options) {
	const { branch, cloneDirectory, url } = options;
	const git = new Git(cloneDirectory);

	logger.info(`Syncing ${ url } to ${ cloneDirectory }`);
	await git.ensureConfig(options.username, options.useremail);
	if (existsSync(cloneDirectory)) {
		logger.info(`Using existing repository at ${ cloneDirectory }`);
		await assertUrl(url, git);
	}
	else {
		await git.clone(url);
	}
	await git.checkout(branch)
		.then(
			() => git.pull('origin', branch),
			() => git.createOrphan(branch)
		);
}
