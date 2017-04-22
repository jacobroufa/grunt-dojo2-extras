import GitHub, { Release } from '../util/GitHub';
export interface ReleaseFilter {
    (release: Release): boolean;
}
export default function missingApis(directory: string, repo: GitHub, filter?: ReleaseFilter | string): Promise<Release[]>;
