var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../util/environment", "../log"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var environment_1 = require("../util/environment");
    var log_1 = require("../log");
    function createCommitMessage(repo) {
        return __awaiter(this, void 0, void 0, function () {
            var username, commit, message;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var publishMode, branch, repo, hasChanges, _a, _b, _c;
            return __generator(this, function (_d) {
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