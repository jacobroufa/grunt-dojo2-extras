import * as config from './config';
import { join, basename, extname } from 'path';
import { readdirSync } from 'fs';

export = function (grunt: IGrunt) {
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

	grunt.registerTask('build', [ 'shell:build-ts' ]);
	grunt.registerTask('dev', [ 'clean', 'tslint', 'build' ]);
	grunt.registerTask('test', [ 'dev', 'intern' ]);
	grunt.registerTask('init', [ 'prompt:github', 'initAutomation' ]);
};
