import { join, basename, dirname } from 'path';
import { promiseExec as exec } from '../util/process';
import { sync as mkdirp } from 'mkdirp';
import { logger } from '../log';
import { existsSync } from 'fs';

export interface BaseOptions {
	source: string;
	target: string;
}

export interface HtmlOptions extends BaseOptions {
	themeDirectory: string;
	format: 'html';
}

export interface JsonOptions extends BaseOptions {
	format: 'json';
}

export interface Options extends BaseOptions {
	themeDirectory?: HtmlOptions['themeDirectory'];
	format: HtmlOptions['format'] | JsonOptions['format'];
}

async function installDependencies(repoDir: string) {
	logger.info('Installing dependencies');
	const typingsJson = join(repoDir, 'typings.json');
	await exec('npm install', {silent: false, cwd: repoDir});

	if (existsSync(typingsJson)) {
		await exec('typings install', {silent: false, cwd: repoDir});
	}
	return typingsJson;
};

export default async function typedoc(options: Options) {
	const { themeDirectory, format, source, target } = options;
	const targetDir = format === 'json' ? dirname(target) : target;
	const targetFile = format === 'json' ? basename(target) || 'api.json' : null;
	const typedocBin = require.resolve('typedoc/bin/typedoc');

	logger.info('Building API Documentation');
	mkdirp(targetDir);

	// install any dependencies to the package
	await installDependencies(source);

	let outputOption: string;
	if (format === 'json') {
		outputOption = `--json ${ join(targetDir, targetFile) }`;
	}
	else {
		outputOption = `--out ${ target }`;

		if (themeDirectory) {
			outputOption += ` --theme ${ themeDirectory }`;
		}
	}
	const command = `${ typedocBin } --mode file ${ source } ${ outputOption } --externalPattern '**/+(example|examples|node_modules|tests|typings)/**/*.ts' --excludeExternals --excludeNotExported --ignoreCompilerErrors`;
	await exec(command);
};
