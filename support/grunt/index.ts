import * as config from './config';
import { join, basename, extname } from 'path';
import { readdirSync } from 'fs';
import { logger } from '../../src/log';

export = function (grunt: IGrunt) {
	logger.level = 'debug';
	require('load-grunt-tasks')(grunt);
	grunt.loadNpmTasks('intern');

	const tasksDirectory = join(__dirname, '../../tasks');
	readdirSync(tasksDirectory).filter(function (path) {
		return extname(path) === '.ts';
	}).forEach(function (file) {
		const mid = join(tasksDirectory, basename(file, '.ts'));
		require(mid)(grunt);
	});

	grunt.initConfig(config);

	grunt.registerTask('build', [ 'shell:build-ts', 'copy:staticDistFiles' ]);
	grunt.registerTask('dev', [ 'clean', 'tslint', 'build' ]);
	grunt.registerTask('test', [ 'dev', 'intern' ]);
	grunt.registerTask('unit', [ 'dev', 'intern:unit' ]);
	grunt.registerTask('integration', [ 'dev', 'intern:integration' ]);
	grunt.registerTask('init', [ 'prompt:github', 'initAutomation' ]);
	grunt.registerTask('cd-latest', [ 'prebuild', 'sync:latest', 'clean:repo', 'copy:latest', 'publish:latest' ]);
	grunt.registerTask('cd-api', [ 'prebuild', 'sync:gh-pages', 'clean:repo', 'api', 'copy:gh-pages', 'publish:gh-pages' ]);
};
