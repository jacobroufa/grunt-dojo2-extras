/// <reference types="grunt" />
export interface Options {
    repo?: string;
}
export interface Slug {
    name: string;
    owner: string;
}
export default function getGithubSlug(options?: Options, grunt?: IGrunt): Slug;
