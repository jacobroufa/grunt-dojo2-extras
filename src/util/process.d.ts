/// <reference types="node" />
import { ChildProcess, ExecOptions as ChildExecOptions, SpawnOptions as ChildSpawnOptions } from 'child_process';
export declare function promisify(proc: ChildProcess): Promise<ChildProcess>;
export interface CommonProcessOptions {
    display?: boolean;
    silent?: boolean;
}
export interface ExecOptions extends CommonProcessOptions, ChildExecOptions {
}
export declare function exec(command: string, options?: ExecOptions): ChildProcess;
export declare function promiseExec(command: string, options?: ExecOptions): Promise<ChildProcess>;
export interface SpawnOptions extends CommonProcessOptions, ChildSpawnOptions {
}
export declare function spawn(command: string, args: string[], options?: SpawnOptions): ChildProcess;
export declare function promiseSpawn(command: string, args: string[], options?: SpawnOptions): Promise<ChildProcess>;
