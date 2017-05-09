import Travis, { EnvironmentVariable as TravisEnvironmentVariable } from '../../util/Travis';
import GitHub, { AuthResponse } from '../../util/GitHub';
import { find } from '@dojo/shim/array';
import * as env from '../../util/environment';
import { logger } from '../../log';

async function shouldCreateGithubAuth(envvars: TravisEnvironmentVariable[], repo: GitHub): Promise<boolean> {
	const authEnvVar = find(envvars, (envvar) => {
		return envvar.name === env.githubAuthName;
	});

	if (!authEnvVar) {
		return true;
	}

	// create a new instance of GitHub. We don't want to spoil our previous authentication.
	repo = new GitHub(repo.owner, repo.name);
	repo.api.authenticate(env.githubAuth(authEnvVar.value));
	const response = await repo.api.misc.getRateLimit({});
	const limits = response.data;
	const hasAuth = limits && limits.resources;

	if (hasAuth) {
		logger.info('An existing environment variable exists with a GitHub authorization');
		logger.info(`Currently ${ limits.resources.core.limit } queries remain`);
	}

	return !hasAuth;
}

export default async function initAuthorization(repo: GitHub, travis: Travis = new Travis()) {
	let appAuth: AuthResponse;

	if (!travis.isAuthorized()) {
		logger.info('Creating a temporary authorization token in GitHub for Travis');
		await travis.createAuthorization(repo);
	}

	try {
		const travisRepo = await travis.fetchRepository(repo.toString());
		const travisEnvVars = await travisRepo.listEnvironmentVariables();

		if (await shouldCreateGithubAuth(travisEnvVars, repo)) {
			logger.info('Creating an OAuth token for GitHub queries');
			appAuth = await repo.createAuthorization({
				note: 'Authorization for Travis to call GitHub APIs',
				fingerprint: repo.toString()
			});

			const tokenStr = JSON.stringify({
				type: 'oauth',
				token: appAuth.token
			});
			await travisRepo.setEnvironmentVariables({ name: env.githubAuthName, value: tokenStr, isPublic: false });
		}
	}
	catch (e) {
		if (appAuth) {
			await repo.deleteAuthorization(appAuth.id);
		}
		throw e;
	}
	finally {
		logger.info('Removing temporary authorization token from GitHub');
		await travis.deleteAuthorization(repo);
	}
}
