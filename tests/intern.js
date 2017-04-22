(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "intern"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    require("intern");
    exports.loaderOptions = {
        packages: [
            { name: 'tslib', location: './node_modules/tslib', main: 'tslib.js' },
            { name: 'tasks', location: './_build/tasks' },
            { name: 'src', location: './_build/src' },
            { name: 'tests', location: './_build/tests' }
        ]
    };
    exports.suites = ['tests/unit/all'];
    exports.excludeInstrumentation = /^(?:_build\/tests|node_modules)\//;
    exports.loaders = {
        'host-node': '@dojo/loader'
    };
    exports.filterErrorStack = true;
});
//# sourceMappingURL=intern.js.map