/// <reference types="node" />
import { ChildProcess } from 'child_process';
export default class Git {
    cloneDirectory: string | null;
    keyFile?: string;
    url?: string;
    constructor(cloneDirectory?: string, keyFile?: string);
    add(...params: string[]): Promise<any>;
    checkout(version: string): Promise<ChildProcess>;
    clone(url: string): Promise<void>;
    commit(message: string): Promise<any>;
    createOrphan(branch: string): Promise<void>;
    ensureConfig(user?: string, email?: string): Promise<void>;
    execSSHAgent(command: string, args: string[], options?: any): Promise<ChildProcess>;
    getConfig(key: string): Promise<string>;
    areFilesChanged(): Promise<boolean>;
    hasConfig(key: string): Promise<boolean>;
    hasDeployCredentials(): boolean;
    headRevision(): Promise<string>;
    isInitialized(): boolean;
    pull(remote?: string, branch?: string): Promise<ChildProcess>;
    push(branch?: string, remote?: string): Promise<ChildProcess>;
    setConfig(key: string, value: string): Promise<ChildProcess>;
}
