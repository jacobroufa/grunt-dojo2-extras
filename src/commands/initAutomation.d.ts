import GitHub from '../util/GitHub';
export default function setupAutomation(repo: GitHub, deployKeyFile?: string, encryptedKeyFile?: any): Promise<{
    decipher: {
        key: string;
        iv: string;
    };
    keys: {
        encryptedKey: any;
        publicKey: string;
        privateKey: string;
    };
}>;
