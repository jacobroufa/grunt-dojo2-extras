import { Response } from '@dojo/core/request';
export interface Release {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
}
export interface Options {
    password?: string;
    username?: string;
}
export interface AuthResponse {
    id: number;
    token: string;
}
export default class GitHub {
    name: string;
    owner: string;
    password: string;
    username: string;
    constructor(owner: string, name: string, options?: Options);
    readonly url: string;
    createAuthorizationToken(note?: string, scopes?: string[]): Promise<AuthResponse>;
    removeAuthorizationToken(id: string | number): Promise<Response>;
    addDeployKey(keyfile: string, title: string, readOnly?: boolean): Promise<any>;
    authenticate(username: string, password: string): void;
    fetchReleases(): Promise<Release[]>;
    getHttpsUrl(): string;
    getSshUrl(): string;
    toString(): string;
    private assertAuthentication();
}
