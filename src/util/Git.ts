import { promiseExec, promiseSpawn, exec } from './process';
import { existsSync, chmodSync } from 'fs';
import { join, relative } from 'path';
import { ChildProcess } from 'child_process';
import { toString } from './streams';
import { logger } from '../log';
import * as env from '../util/environment';

export default class Git {
	cloneDirectory: string | null;

	keyFile?: string;

	url?: string;

	constructor(cloneDirectory: string = process.cwd(), keyFile: string = env.keyFile()) {
		this.cloneDirectory = cloneDirectory;
		this.keyFile = keyFile;
	}

	async add(... params: string[]): Promise<any> {
		return promiseExec(`git add ${ params.join(' ') }`, { silent: false, cwd: this.cloneDirectory});
	}

	checkout(version: string) {
		return promiseExec(`git checkout ${ version }`, { silent: false, cwd: this.cloneDirectory});
	}

	async clone(url: string) {
		if (!this.cloneDirectory) {
			throw new Error('A clone directory must be set');
		}
		logger.info(`Cloning ${ url } to ${ this.cloneDirectory }`);
		if (existsSync(this.cloneDirectory)) {
			logger.info(`Repository exists at ${ this.cloneDirectory }`);
			const repoUrl = await this.getConfig('remote.origin.url');
			if (repoUrl !== url) {
				throw new Error(`Repository mismatch. Expected "${ repoUrl }" to be "${ url }".`);
			}
		}
		await this.execSSHAgent('git', [ 'clone', url, this.cloneDirectory ], { silent: false });
		this.url = url;
	}

	async commit(message: string): Promise<any> {
		return this.execSSHAgent('git', ['commit', '-m', `"${ message }"`], { silent: false, cwd: this.cloneDirectory });
	}

	async createOrphan(branch: string) {
		if (!this.cloneDirectory) {
			throw new Error('A clone directory must be set');
		}
		await promiseExec(`git checkout --orphan ${ branch }`, { silent: true, cwd: this.cloneDirectory });
		await promiseExec('git rm -rf .', { silent: true, cwd: this.cloneDirectory });
		logger.info(`Created "${ branch }" branch`);
	}

	/**
	 * Ensures configuration required by GitHub exists
	 * @param user a fallback user name if one does not exist
	 * @param email a fallback email if one does not exist
	 */
	async ensureConfig(user: string = 'Travis CI', email: string = 'support@sitepen.com') {
		if (!(await this.hasConfig('user.name'))) {
			await this.setConfig('user.name', user);
		}
		if (!(await this.hasConfig('user.email'))) {
			await this.setConfig('user.email', email);
		}
	}

	/**
	 * Execute a credentialed git command
	 */
	execSSHAgent(command: string, args: string[], options: any = {}): Promise<ChildProcess> {
		if (this.hasDeployCredentials()) {
			const deployKey: string = <string> this.keyFile;
			const relativeDeployKey = options.cwd ? relative(options.cwd, deployKey) : deployKey;
			chmodSync(deployKey, '600');
			return promiseExec(`ssh-agent bash -c 'ssh-add ${ relativeDeployKey }; ${ command } ${ args.join(' ') }'`, options);
		}
		else {
			logger.info(`Deploy Key "${ this.keyFile }" is not present. Using environment credentials for ${ args[0] }.`);
			return promiseSpawn(command, args, options);
		}
	}

	async getConfig(key: string): Promise<string> {
		const proc = await exec(`git config ${ key }`, { silent: true, cwd: this.cloneDirectory });
		return (await toString(proc.stdout)).trim();
	}

	async areFilesChanged(): Promise<boolean> {
		const proc = await exec('git status --porcelain', { silent: true, cwd: this.cloneDirectory });
		const changes = (await toString(proc.stdout)).trim();
		return changes !== '';
	}

	async hasConfig(key: string): Promise<boolean> {
		const value = await this.getConfig(key);
		return !!value;
	}

	/**
	 * @return {boolean} if a deploy key exists in the file system
	 */
	hasDeployCredentials(): boolean {
		return existsSync(this.keyFile);
	}

	async headRevision() {
		const proc = await exec(`git rev-parse HEAD`, { silent: false, cwd: this.cloneDirectory });
		return (await toString(proc.stdout)).trim();
	}

	/**
	 * If the current cloneDirectory is a git repository
	 */
	isInitialized() {
		if (!this.cloneDirectory) {
			throw new Error('A clone directory must be set');
		}
		return existsSync(this.cloneDirectory) && existsSync(join(this.cloneDirectory, '.git'));
	}

	pull(remote?: string, branch?: string) {
		const command = [ 'pull' ];
		if (remote || branch) {
			command.push(remote);
			command.push(branch);
		}
		return this.execSSHAgent('git', command, {
			cwd: this.cloneDirectory
		});
	}

	push(branch?: string, remote: string = 'origin') {
		const params: string[] = branch ? [ 'push', remote, branch ] : [ 'push' ];
		return this.execSSHAgent('git', params, { silent: false, cwd: this.cloneDirectory });
	}

	setConfig(key: string, value: string) {
		// TODO make global optional
		return promiseExec(`git config --global ${ key } ${ value }`, { silent: false });
	}
}
