export const distDirectory = '_build';

export const clean = {
	build: [ '<%= distDirectory %>' ]
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

export const tslint = {
	options: {
		configuration: 'tslint.json'
	},
	support: 'support/**/*.ts',
	tasks: 'tasks/**/*.ts',
	tests: 'tests/**/*.ts'
};
