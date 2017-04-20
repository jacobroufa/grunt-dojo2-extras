export const latestDirectory = '_latest';

export const distDirectory = '_build';

export const clean = {
	build: [ '<%= distDirectory %>' ],
	dists: [ '<%= latestDirectory %>' ],
	latest: [ '<%= latestDirectory %>/**/*', '!.git/**' ]
};

export const copy = {
	latest: {
		expand: true,
		cwd: '<%= distDirectory %>',
		src: '**',
		dest: '<%= latestDirectory %>'
	},
	staticDistFiles: {
		expand: true,
		cwd: '.',
		src: [ 'README.md', 'LICENSE', 'package.json' ],
		dest: '<%= distDirectory %>'
	}
};

export const intern = {
	unit: {
		options: {
			runType: 'client',
			config: '_build/tests/intern',
			reporters: [
				'Console', 'LcovHtml'
			]
		}
	}
};

export const prompt = {
	github: {
		options: {
			questions: [
				{
					config: 'github.username',
					type: 'input',
					message: 'Github username'
				},
				{
					config: 'github.password',
					type: 'password',
					message: 'Github password'
				}
			]
		}
	}
};

export const publish = {
	'latest': {
		options: {
			branch: 'latest',
			cloneDirectory: '<%= latestDirectory %>'
		}
	}
};

export const shell = {
	'build-ts': {
		command: 'tsc',
		options: {
			execOptions: {
				cwd: 'support'
			}
		}
	}
};

export const sync = {
	latest: {
		options: {
			branch: 'latest',
			cloneDirectory: '<%= latestDirectory %>'
		}
	}
};

export const tslint = {
	options: {
		configuration: 'tslint.json'
	},
	support: 'support/**/*.ts',
	tasks: 'tasks/**/*.ts',
	tests: 'tests/**/*.ts'
};
