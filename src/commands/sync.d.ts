export interface Options {
    branch: string;
    cloneDirectory: string;
    url: string;
    username?: string;
    useremail?: string;
}
export default function sync(options: Options): Promise<void>;
