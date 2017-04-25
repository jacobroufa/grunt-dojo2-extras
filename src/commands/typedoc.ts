import { dirname } from 'path';
import { promiseExec as exec } from '../util/process';
import { sync as mkdirp } from 'mkdirp';
import { logger } from '../log';

export interface BaseOptions {
	source: string;
	mode?: string;
	exclude?: string;
	includeDeclarations?: boolean;
	externalPattern?: string;
	excludeExternals?: boolean;
	excludePrivate?: boolean;
	module?: 'common.js' | 'amd' | 'system' | 'umd';
	target?: 'ES3' | 'ES5' | 'ES6';
}

export interface HtmlOptions extends BaseOptions {
	out: string;
	theme?: 'default' | 'minimal' | string;
	name?: string;
	readme?: string;
	hideGenerator?: boolean;
	gaID?: string;
	gaSite?: string;
	entryPoint?: string;
	includes?: string;
	media?: string;
}

export interface JsonOptions extends BaseOptions {
	json: string;
}

export type Options = HtmlOptions | JsonOptions;

async function runTypedoc(options: Options) {
	const typedocBin = require.resolve('typedoc/bin/typedoc');
	const excluded = [ 'source' ];
	const commandOptions = [];
	for (const name in options) {
		if (excluded.indexOf(name) === -1) {
			const value: any = (<any> options)[name];
			if (typeof value === 'boolean') {
				commandOptions.push(`--${ name }`);
			}
			else {
				commandOptions.push(`--${ name } ${ value }`);
			}
		}
	}
	if (options.source) {
		commandOptions.push(options.source);
	}
	const command = `${ typedocBin } ${ commandOptions.join(' ')}`;
	await exec(command);
}

function isJsonOptions(options: Options): options is JsonOptions {
	return 'json' in options;
}

export default async function typedoc(options: Options) {
	const dir = isJsonOptions(options) ? dirname(options.json) : options.out;

	logger.info(`Building API Documentation to ${ dir }`);
	mkdirp(dir);
	await runTypedoc(options);
}
