import Git from '../util/Git';
export declare type PublishMode = 'publish' | 'commit' | 'skip';
export interface Options {
    branch: string;
    publishMode: (() => PublishMode) | PublishMode;
    repo: Git;
    username?: string;
    useremail?: string;
}
export default function publish(options: Options): Promise<void>;
