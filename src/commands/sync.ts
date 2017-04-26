import Git from '../util/Git';
import { logger } from '../log';

export interface Options {
	branch: string;
	cloneDirectory: string;
	url: string;
	username?: string;
	useremail?: string;
}

export default async function sync(options: Options) {
	const { branch, cloneDirectory, url } = options;
	const git = new Git(cloneDirectory);

	logger.info(`Syncing ${ url } to ${ cloneDirectory }`);
	await git.ensureConfig(options.username, options.useremail);
	if (git.isInitialized()) {
		logger.info(`Using existing repository at ${ cloneDirectory }`);
		await git.assert(url);
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
