import Git from '../util/Git';
export interface Options {
    branch: string;
    cloneDirectory: string;
    url: string;
    username?: string;
    useremail?: string;
}
export declare function assertUrl(url: string, git: Git): Promise<void>;
export default function sync(options: Options): Promise<void>;
