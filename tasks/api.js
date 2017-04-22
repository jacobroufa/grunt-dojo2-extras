(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../src/commands/typedoc", "../src/commands/missingApis", "./util/wrapAsyncTask", "../src/util/GitHub", "../src/commands/sync"], factory);
    }
})(function (require, exports) {
    "use strict";
    var tslib_1 = require("tslib");
    var typedoc_1 = require("../src/commands/typedoc");
    var missingApis_1 = require("../src/commands/missingApis");
    var wrapAsyncTask_1 = require("./util/wrapAsyncTask");
    var GitHub_1 = require("../src/util/GitHub");
    var sync_1 = require("../src/commands/sync");
    function isRemoteOptions(options) {
        return !!options.repo && !!options.cloneDirectory;
    }
    function getGitHub(repo) {
        if (typeof repo === 'string') {
            var _a = repo.split('/'), owner = _a[0], name_1 = _a[1];
            return new GitHub_1.default(owner, name_1);
        }
        else {
            return new GitHub_1.default(repo.owner, repo.name);
        }
    }
    return function (grunt) {
        function typedocTask() {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var options, dest, format, src, themeDirectory, cloneDirectory, filter, repo, missing, _i, missing_1, release;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            options = this.options({
                                format: 'html'
                            });
                            dest = options.dest, format = options.format, src = options.src, themeDirectory = options.themeDirectory;
                            if (!isRemoteOptions(options)) return [3 /*break*/, 5];
                            cloneDirectory = options.cloneDirectory, filter = options.filter;
                            repo = getGitHub(options.repo);
                            return [4 /*yield*/, missingApis_1.default(dest, repo, filter)];
                        case 1:
                            missing = _a.sent();
                            _i = 0, missing_1 = missing;
                            _a.label = 2;
                        case 2:
                            if (!(_i < missing_1.length)) return [3 /*break*/, 5];
                            release = missing_1[_i];
                            return [4 /*yield*/, sync_1.default({
                                    branch: release.name,
                                    cloneDirectory: cloneDirectory,
                                    url: repo.url
                                })];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5: return [4 /*yield*/, typedoc_1.default({
                                themeDirectory: themeDirectory,
                                format: format,
                                source: src,
                                target: dest
                            })];
                        case 6:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        grunt.registerMultiTask('api', wrapAsyncTask_1.default(typedocTask));
    };
});
//# sourceMappingURL=api.js.map