(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./util/wrapAsyncTask", "../src/commands/decryptDeployKey", "../src/log"], factory);
    }
})(function (require, exports) {
    "use strict";
    var tslib_1 = require("tslib");
    var wrapAsyncTask_1 = require("./util/wrapAsyncTask");
    var decryptDeployKey_1 = require("../src/commands/decryptDeployKey");
    var log_1 = require("../src/log");
    return function (grunt) {
        function prebuildTask() {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var result;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, decryptDeployKey_1.default()];
                        case 1:
                            result = _a.sent();
                            if (result) {
                                log_1.logger.info('Decrypted deploy key');
                            }
                            return [2 /*return*/];
                    }
                });
            });
        }
        grunt.registerTask('prebuild', 'prepares a the ci environment', wrapAsyncTask_1.default(prebuildTask));
    };
});
//# sourceMappingURL=prebuild.js.map