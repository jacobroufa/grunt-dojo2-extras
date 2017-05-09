import Travis, { EnvironmentVariable as TravisEnvironmentVariable } from '../../util/Travis';
import * as env from '../../util/environment';
import { existsSync, readFileSync } from 'fs';
import { logger } from '../../log';
import GitHub from '../../util/GitHub';
import createDeployKey from './createDeployKey';
import { find } from '@dojo/shim/array';

export interface Options {
	deployKeyFile: string;
	encryptedKeyFile: string;
}

function shouldCreateDeployKey(envvars: TravisEnvironmentVariable[], encryptedKeyFile: string) {
	const hasKeyValue = envvars.some((envvar) => {
		return envvar.name === env.decryptKeyName;
	});
	const hasIvValue = envvars.some((envvar) => {
		return envvar.name === env.decryptIvName;
	});
	const hasEncryptedKeyFile = existsSync(encryptedKeyFile);
	const result = hasKeyValue && hasIvValue && hasEncryptedKeyFile;

	if (hasKeyValue !== result || hasIvValue !== result || hasEncryptedKeyFile !== result) {
		logger.error('There is an environment mismatch between one or more decrypted key states');
		logger.error(`Encrypted key file exists: ${ hasEncryptedKeyFile }`);
		logger.error(`Travis has an environment variable "${ env.decryptKeyName }": ${ hasKeyValue }`);
		logger.error(`Travis has an environment variable "${ env.decryptIvName }": ${ hasIvValue }`);
		logger.error(`A deploy key will not be processed. The environment setup should be investigated.`);
		throw new Error('Please review your environment!');
	}

	return !result;
}

function displayDeployOptionSummary(envvars: TravisEnvironmentVariable[]) {
	const deployEnvVar = find(envvars, (envvar) => {
		return envvar.name === 'DEPLOY_DOCS';
	});

	if (deployEnvVar) {
		logger.info(`It looks like this repository has DEPLOY_DOCS is set to "${ deployEnvVar.value }"`);
	}
	if (!deployEnvVar || deployEnvVar.value !== 'publish') {
		logger.info('To begin publishing this site please add the DEPLOY_DOCS environment variable to Travis');
		logger.info('and set its value to "publish"');
	}
}

export default async function initDeployment(repo: GitHub, travis = new Travis(), options: Options = {
	deployKeyFile: env.keyFile(),
	encryptedKeyFile: env.encryptedKeyFile()
}) {
	const { deployKeyFile, encryptedKeyFile } = options;
	let keyResponse: { id: number };

	if (!travis.isAuthorized()) {
		logger.info('Creating a temporary authorization token in GitHub for Travis');
		await travis.createAuthorization(repo);
	}

	try {
		const travisRepo = await travis.fetchRepository(repo.toString());
		const travisEnvVars = await travisRepo.listEnvironmentVariables();

		if (shouldCreateDeployKey(travisEnvVars, encryptedKeyFile)) {
			const keys = await
			createDeployKey(deployKeyFile, encryptedKeyFile);

			logger.info('Adding deployment key to GitHub');
			keyResponse = await repo.createKey(readFileSync(keys.publicKey, {encoding: 'utf8'}))

			await
			travisRepo.setEnvironmentVariables(
				{name: env.decryptKeyName, value: keys.encryptedKey.key, isPublic: false},
				{name: env.decryptIvName, value: keys.encryptedKey.iv, isPublic: false}
			);

			logger.info('');
			logger.info(`A new encrypted deploy key has been created at ${ encryptedKeyFile }.`);
			logger.info(`Please commit this to your GitHub repository. The unencrypted keys "${ keys.publicKey }"`);
			logger.info(`and "${ keys.privateKey }" may be deleted.`);
			logger.info(`Variables to decrypt this key have been added to your Travis repository with the name`);
			logger.info(`"${ env.decryptKeyName }" and "${ env.decryptIvName }".`);
		}
		else {
			logger.info(`An encrypted deploy key already exists at "${ encryptedKeyFile }" so a new one was not created.`);
		}

		displayDeployOptionSummary(travisEnvVars);
	}
	catch (e) {
		logger.error(`There was an error ${ e.message }. Cleaning up...`);
		if (keyResponse) {
			await repo.deleteKey(keyResponse.id);
		}
		throw e;
	}
	finally {
		logger.info('Removing temporary authorization token from GitHub');
		await travis.deleteAuthorization(repo);
	}
}
