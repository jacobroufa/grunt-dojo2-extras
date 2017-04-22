export interface BaseOptions {
    source: string;
    target: string;
}
export interface HtmlOptions extends BaseOptions {
    themeDirectory: string;
    format: 'html';
}
export interface JsonOptions extends BaseOptions {
    format: 'json';
}
export interface Options extends BaseOptions {
    themeDirectory?: HtmlOptions['themeDirectory'];
    format: HtmlOptions['format'] | JsonOptions['format'];
}
export default function typedoc(options: Options): Promise<void>;
