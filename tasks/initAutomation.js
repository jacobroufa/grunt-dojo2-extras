(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./util/wrapAsyncTask", "../src/util/GitHub", "./util/getGithubSlug", "../src/commands/initAutomation"], factory);
    }
})(function (require, exports) {
    "use strict";
    var tslib_1 = require("tslib");
    var wrapAsyncTask_1 = require("./util/wrapAsyncTask");
    var GitHub_1 = require("../src/util/GitHub");
    var getGithubSlug_1 = require("./util/getGithubSlug");
    var initAutomation_1 = require("../src/commands/initAutomation");
    return function (grunt) {
        function initTask() {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var options, _a, name, owner, repo;
                return tslib_1.__generator(this, function (_b) {
                    options = this.options({
                        password: grunt.config.get('github.password'),
                        username: grunt.config.get('github.username')
                    });
                    _a = getGithubSlug_1.default(options, grunt), name = _a.name, owner = _a.owner;
                    repo = new GitHub_1.default(owner, name, {
                        password: options.password,
                        username: options.username
                    });
                    return [2 /*return*/, initAutomation_1.default(repo)];
                });
            });
        }
        grunt.registerMultiTask('initAutomation', wrapAsyncTask_1.default(initTask));
    };
});
//# sourceMappingURL=initAutomation.js.map