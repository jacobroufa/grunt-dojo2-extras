(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../src/commands/publish", "../src/util/Git", "./util/wrapAsyncTask", "../src/util/environment"], factory);
    }
})(function (require, exports) {
    "use strict";
    var tslib_1 = require("tslib");
    var publish_1 = require("../src/commands/publish");
    var Git_1 = require("../src/util/Git");
    var wrapAsyncTask_1 = require("./util/wrapAsyncTask");
    var environment_1 = require("../src/util/environment");
    return function (grunt) {
        function publishTask() {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var options, publishModeCli;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            options = this.options({
                                publishMode: function () {
                                    if (environment_1.hasGitCredentials()) {
                                        return environment_1.publishMode();
                                    }
                                    return 'skip';
                                }
                            });
                            publishModeCli = grunt.option('publishmode');
                            if (publishModeCli) {
                                options.publishMode = publishModeCli;
                            }
                            options.repo = new Git_1.default(options.cloneDirectory);
                            return [4 /*yield*/, publish_1.default(options)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        grunt.registerMultiTask('publish', wrapAsyncTask_1.default(publishTask));
    };
});
//# sourceMappingURL=publish.js.map