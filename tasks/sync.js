(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../src/commands/sync", "./util/wrapAsyncTask", "./util/getGithubSlug", "../src/util/GitHub", "../src/util/Git", "../src/log"], factory);
    }
})(function (require, exports) {
    "use strict";
    var tslib_1 = require("tslib");
    var sync_1 = require("../src/commands/sync");
    var wrapAsyncTask_1 = require("./util/wrapAsyncTask");
    var getGithubSlug_1 = require("./util/getGithubSlug");
    var GitHub_1 = require("../src/util/GitHub");
    var Git_1 = require("../src/util/Git");
    var log_1 = require("../src/log");
    function getRepoUrl(options, grunt) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, name, owner, repo, git;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (options.url) {
                            return [2 /*return*/, options.url];
                        }
                        _a = getGithubSlug_1.default(options, grunt), name = _a.name, owner = _a.owner;
                        if (name && owner) {
                            repo = new GitHub_1.default(owner, name);
                            return [2 /*return*/, repo.url];
                        }
                        log_1.logger.info('Repository not explicitly defined. Using current git repository url.');
                        git = new Git_1.default();
                        return [4 /*yield*/, git.getConfig('remote.origin.url')];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    }
    return function (grunt) {
        function syncTask() {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var options, _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            options = this.options({});
                            _a = options;
                            return [4 /*yield*/, getRepoUrl(options, grunt)];
                        case 1:
                            _a.url = _b.sent();
                            return [4 /*yield*/, sync_1.default(options)];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        grunt.registerMultiTask('sync', wrapAsyncTask_1.default(syncTask));
    };
});
//# sourceMappingURL=sync.js.map