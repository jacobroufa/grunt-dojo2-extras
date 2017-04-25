import { logger } from '../log';
import { join } from 'path';
import { exec } from '../util/process';
import { existsSync } from 'fs';

export default async function installDependencies(dir: string) {
	logger.info('Installing dependencies');
	const typingsJson = join(dir, 'typings.json');
	await exec('npm install', {silent: false, cwd: dir});

	if (existsSync(typingsJson)) {
		await exec('typings install', {silent: false, cwd: dir});
	}
	return typingsJson;
}
