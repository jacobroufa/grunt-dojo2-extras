export interface BaseOptions {
    source: string;
    mode?: string;
    exclude?: string;
    includeDeclarations?: boolean;
    externalPattern?: string;
    excludeExternals?: boolean;
    excludePrivate?: boolean;
    module?: 'common.js' | 'amd' | 'system' | 'umd';
    target?: 'ES3' | 'ES5' | 'ES6';
}
export interface HtmlOptions extends BaseOptions {
    out: string;
    theme?: 'default' | 'minimal' | string;
    name?: string;
    readme?: string;
    hideGenerator?: boolean;
    gaID?: string;
    gaSite?: string;
    entryPoint?: string;
    includes?: string;
    media?: string;
}
export interface JsonOptions extends BaseOptions {
    json: string;
}
export declare type Options = HtmlOptions | JsonOptions;
export default function typedoc(options: Options): Promise<void>;
