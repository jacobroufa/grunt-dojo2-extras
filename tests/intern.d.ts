import 'intern';
export declare const loaderOptions: {
    packages: ({
        name: string;
        location: string;
        main: string;
    } | {
        name: string;
        location: string;
    })[];
};
export declare const suites: string[];
export declare const excludeInstrumentation: RegExp;
export declare const loaders: {
    'host-node': string;
};
export declare const filterErrorStack: boolean;
