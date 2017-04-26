import { dirname, extname } from 'path';
import { sync as mkdirp } from 'mkdirp';
import { logger } from '../log';
import { Application as TypedocApp, ProjectReflection } from 'typedoc';
import { OptionsReadResult } from 'typedoc/dist/lib/utils/options';
import { inspect } from 'util';
import { existsSync, statSync } from 'fs';
import { findConfigFile } from 'typescript';

export interface BaseOptions {
	mode?: string;
	exclude?: string;
	includeDeclarations?: boolean;
	externalPattern?: string;
	excludeExternals?: boolean;
	excludePrivate?: boolean;
	module?: 'common.js' | 'amd' | 'system' | 'umd';
	target?: 'ES3' | 'ES5' | 'ES6';
	tsconfig?: boolean | string;
}

export interface HtmlOptions extends BaseOptions {
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

export type Options = HtmlOptions | BaseOptions;

class Typedoc extends TypedocApp {
	bootstrapResult: OptionsReadResult;

	protected bootstrap(options?: any): OptionsReadResult {
		return this.bootstrapResult = super.bootstrap(options);
	}

	generateJson(project: ProjectReflection | string[], out: string): boolean {
		mkdirp(dirname(out));
		return super.generateJson(<any> project, out);
	}

	generateDocs(project: ProjectReflection | string[], out: string): boolean {
		mkdirp(out);
		return super.generateDocs(<any> project, out);
	}
}

function setOptions(source: string, options: BaseOptions): BaseOptions {
	options = (<any> Object).assign({
		module: 'umd',
		target: 'ES5'
	}, options);

	if (options.tsconfig !== false) {
		if (typeof options.tsconfig !== 'string') {
			const config = findConfigFile(source, existsSync);
			options.tsconfig = config;
		}
	}
	else {
		delete options.tsconfig;
		if (statSync(source).isDirectory()) {
			logger.warn('typedoc cannot parse a directory without a tsconfig.json');
		}
	}

	logger.debug(`Typedoc Options ${ inspect(options) }`);

	return options;
}

export default async function typedoc(source: string, target: string, options: BaseOptions | HtmlOptions = {}) {
	logger.info(`Building API Documentation for "${ source }" to "${ target }"`);
	options = setOptions(source, options);

	const doc = new Typedoc(options);
	const files = doc.expandInputFiles(doc.bootstrapResult.inputFiles);
	logger.debug(`Processing files ${ inspect(files) }`);

	if (extname(target) === '.json') {
		doc.generateJson(files, target);
	}
	else {
		doc.generateDocs(files, target);
	}
}
