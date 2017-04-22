/// <reference types="node" />
import { Cipher, Decipher } from 'crypto';
import ReadableStream = NodeJS.ReadableStream;
export interface EncryptResult {
    encrypted: Cipher;
    iv: string;
    key: string;
}
export interface KeyPairFiles {
    publicKey: string;
    privateKey: string;
}
export declare function createDeployKey(deployKeyFile?: string, keyComment?: string): Promise<KeyPairFiles>;
export declare function decryptData(data: ReadableStream, key: string, iv: string): Decipher;
export declare function encryptData(data: ReadableStream, key?: string, iv?: string): EncryptResult;
