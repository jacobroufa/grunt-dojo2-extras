import GitHub, { Release } from '../util/GitHub';
export interface ReleaseFilter {
    (release: Release, index: number, array: Release[]): boolean;
}
export declare function getHtmlApiPath(base: string, project: string, version: string): string;
export declare function getJsonApiPath(base: string, project: string, version: string): string;
export declare function createHtmlExistsFilter(project: string, directory: string): ReleaseFilter;
export declare function createJsonExistsFilter(project: string, directory: string): ReleaseFilter;
export declare function latestFilter(_release: Release, index: number): boolean;
export declare function createVersionFilter(comp: string): ReleaseFilter;
export default function getReleases(repo: GitHub, filters?: ReleaseFilter[]): Promise<Release[]>;
