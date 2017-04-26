export interface BaseOptions {
    mode?: string;
    exclude?: string;
    includeDeclarations?: boolean;
    externalPattern?: string;
    excludeExternals?: boolean;
    excludePrivate?: boolean;
    module?: 'common.js' | 'amd' | 'system' | 'umd';
    target?: 'ES3' | 'ES5' | 'ES6';
    tsconfig?: boolean | string;
}
export interface HtmlOptions extends BaseOptions {
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
export declare type Options = HtmlOptions | BaseOptions;
export default function typedoc(source: string, target: string, options?: BaseOptions | HtmlOptions): Promise<void>;
