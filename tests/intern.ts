import 'intern';

export const loaderOptions = {
	packages: [
		{ name: 'assets', location: 'assets' },
		{ name: 'tslib', location: './node_modules/tslib', main: 'tslib.js' },
		{ name: 'tasks', location: './_build/tasks' },
		{ name: 'src', location: './_build/src' },
		{ name: 'tests', location: './_build/tests' }
	]
};

export const suites = [ 'tests/unit/all' ];

export const excludeInstrumentation = /^(?:_build\/tests|node_modules)\//;

export const loaders = {
	'host-node': '@dojo/loader'
};

export const filterErrorStack = true;
