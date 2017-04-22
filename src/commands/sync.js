(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../util/Git", "../log", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var Git_1 = require("../util/Git");
    var log_1 = require("../log");
    var fs_1 = require("fs");
    function assertUrl(url, git) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var remoteUrl;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, git.getConfig('remote.origin.url')];
                    case 1:
                        remoteUrl = _a.sent();
                        if (url !== remoteUrl) {
                            throw new Error("Existing repository url \"" + remoteUrl + "\" is different from requested \"" + url + "\"");
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.assertUrl = assertUrl;
    function sync(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var branch, cloneDirectory, url, git;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        branch = options.branch, cloneDirectory = options.cloneDirectory, url = options.url;
                        git = new Git_1.default(cloneDirectory);
                        log_1.logger.info("Syncing " + url + " to " + cloneDirectory);
                        return [4 /*yield*/, git.ensureConfig(options.username, options.useremail)];
                    case 1:
                        _a.sent();
                        if (!fs_1.existsSync(cloneDirectory)) return [3 /*break*/, 3];
                        log_1.logger.info("Using existing repository at " + cloneDirectory);
                        return [4 /*yield*/, assertUrl(url, git)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, git.clone(url)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, git.checkout(branch)
                            .then(function () { return git.pull(); }, function () { return git.createOrphan(branch); })];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.default = sync;
});
//# sourceMappingURL=sync.js.map