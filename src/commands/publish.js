(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../util/environment", "../log"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var environment_1 = require("../util/environment");
    var log_1 = require("../log");
    function createCommitMessage(repo) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var username, commit, message;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, repo.getConfig('user.name')];
                    case 1:
                        username = _a.sent();
                        commit = environment_1.gitCommit();
                        message = "Published by " + username;
                        if (commit) {
                            message += " from commit " + commit;
                        }
                        return [2 /*return*/, message];
                }
            });
        });
    }
    function publish(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var publishMode, branch, repo, hasChanges, _a, _b, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        publishMode = typeof options.publishMode === 'function' ? options.publishMode() : options.publishMode;
                        branch = options.branch, repo = options.repo;
                        if (publishMode !== 'commit' && publishMode !== 'publish') {
                            log_1.logger.info('skipping publish.');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, repo.areFilesChanged()];
                    case 1:
                        hasChanges = _d.sent();
                        if (!hasChanges) {
                            log_1.logger.info('No files changed. Skipping publish.');
                            return [2 /*return*/];
                        }
                        if (publishMode === 'publish') {
                            log_1.logger.info("Publishing to " + repo.cloneDirectory);
                        }
                        else {
                            log_1.logger.info("Committing " + repo.cloneDirectory + ". Skipping publish.");
                        }
                        return [4 /*yield*/, repo.ensureConfig(options.username, options.useremail)];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, repo.add('--all')];
                    case 3:
                        _d.sent();
                        _b = (_a = repo).commit;
                        return [4 /*yield*/, createCommitMessage(repo)];
                    case 4: return [4 /*yield*/, _b.apply(_a, [_d.sent()])];
                    case 5:
                        _d.sent();
                        if (!(publishMode === 'publish')) return [3 /*break*/, 7];
                        return [4 /*yield*/, repo.push(branch)];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
    exports.default = publish;
});
//# sourceMappingURL=publish.js.map