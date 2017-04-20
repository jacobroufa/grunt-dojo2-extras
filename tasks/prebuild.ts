import IMultiTask = grunt.task.IMultiTask;
import wrapAsyncTask from './util/wrapAsyncTask';
import decryptDeployKey from '../src/commands/decryptDeployKey';
import { logger } from '../src/log';

/**
 * Prepares a continuous integration environment for a build
 */
export = function (grunt: IGrunt) {
	async function prebuildTask(this: IMultiTask<any>) {
		const result = await decryptDeployKey();

		if (result) {
			logger.info('Decrypted deploy key');
		}
	}

	grunt.registerTask('prebuild', 'prepares a the ci environment', wrapAsyncTask(prebuildTask));
};
