/// <reference types="node" />
import { Readable } from 'stream';
import EventEmitter = NodeJS.EventEmitter;
export interface Stream extends EventEmitter {
    readable: Readable['readable'];
}
export declare function toString(stream: Readable): Promise<string>;
export declare function equal(aStream: Stream, bStream: Stream): Promise<{}>;
