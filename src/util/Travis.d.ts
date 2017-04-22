export interface AuthenticateResponse {
    access_token: string;
}
export interface FetchRepositoryResponse {
    repo: RepositoryData;
}
export default class Travis {
    token: string;
    authenticate(githubToken: string): Promise<string>;
    fetchRepository(slug: string): Promise<Repository>;
}
export interface RepositoryData {
    active: boolean;
    id: number;
    slug: string;
}
export interface EnviornmentVariable {
    id: string;
    name: string;
    value: string;
    'public': boolean;
    repository_id: number;
}
export interface ListEnvironmentVariablesResponse {
    env_vars: EnviornmentVariable[];
}
export declare class Repository {
    active: boolean;
    id: number;
    slug: string;
    token: string;
    constructor(token: string, repo: RepositoryData);
    listEnvironmentVariables(): Promise<EnviornmentVariable[]>;
    setEnvironmentVariables(...variables: Array<{
        name: string;
        value: string;
        isPublic?: boolean;
    }>): Promise<void>;
    private addEnvironmentVariable(name, value, isPublic?);
    private updateEnvironmentVariable(id, name, value, isPublic?);
}
