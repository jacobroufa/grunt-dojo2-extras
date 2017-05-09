import { createReadStream, createWriteStream, existsSync } from 'fs';
import { logger } from '../../log';
import { createKey, decryptData, encryptData, EncryptResult, KeyPairFiles } from '../../util/crypto';
import * as env from '../../util/environment';
import { equal } from '../../util/streams';

async function initDeployKey(deployKeyFile: string) {
	if (existsSync(deployKeyFile)) {
		throw new Error('Deploy key already exists');
	}

	return await createKey(deployKeyFile);
}

async function encryptDeployKey(privateKey: string, encryptedKeyFile: any | string) {
	const enc = encryptData(createReadStream(privateKey));
	await new Promise(function (resolve) {
		enc.encrypted.pipe(createWriteStream(encryptedKeyFile))
			.on('close', function () {
				resolve();
			});
	});
	return enc;
}

export default async function createDeployKey(
	deployKeyFile: string = env.keyFile(),
	encryptedKeyFile: string = env.encryptedKeyFile(deployKeyFile)
): Promise<KeyPairFiles & { encryptedKey: EncryptResult }> {
	logger.info('Creating a deployment key');
	const keys = await initDeployKey(deployKeyFile);

	logger.info('Encrypting deployment key');
	const enc = await encryptDeployKey(keys.privateKey, encryptedKeyFile);

	logger.info(`Confirm decrypt deploy key`);
	await equal(decryptData(createReadStream(encryptedKeyFile), enc.key, enc.iv), createReadStream(keys.privateKey));

	return {
		privateKey: keys.privateKey,
		publicKey: keys.publicKey,
		encryptedKey: enc
	};
}
