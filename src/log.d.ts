/// <reference types="winston" />
/// <reference types="node" />
import { LoggerInstance } from 'winston';
import { Writable, WritableOptions } from 'stream';
export declare const logger: LoggerInstance;
export declare class LogStream extends Writable {
    private buffer;
    readonly level: string;
    constructor(level?: string, opts?: WritableOptions);
    end(): void;
    end(chunk: any, cb?: Function): void;
    end(chunk: any, encoding?: string, cb?: Function): void;
    _write(chunk: any, encoding: string, callback: Function): void;
    private writeLog(str);
    private writeLogMultiline(chunk);
}
export default logger;
