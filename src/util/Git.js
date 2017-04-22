(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./process", "fs", "path", "./streams", "../log", "../util/environment"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var process_1 = require("./process");
    var fs_1 = require("fs");
    var path_1 = require("path");
    var streams_1 = require("./streams");
    var log_1 = require("../log");
    var env = require("../util/environment");
    var Git = (function () {
        function Git(cloneDirectory, keyFile) {
            if (cloneDirectory === void 0) { cloneDirectory = process.cwd(); }
            if (keyFile === void 0) { keyFile = env.keyFile(); }
            this.cloneDirectory = cloneDirectory;
            this.keyFile = keyFile;
        }
        Git.prototype.add = function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    return [2 /*return*/, process_1.promiseExec("git add " + params.join(' '), { silent: false, cwd: this.cloneDirectory })];
                });
            });
        };
        Git.prototype.checkout = function (version) {
            return process_1.promiseExec("git checkout " + version, { silent: false, cwd: this.cloneDirectory });
        };
        Git.prototype.clone = function (url) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var repoUrl;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.cloneDirectory) {
                                throw new Error('A clone directory must be set');
                            }
                            log_1.logger.info("Cloning " + url + " to " + this.cloneDirectory);
                            if (!fs_1.existsSync(this.cloneDirectory)) return [3 /*break*/, 2];
                            log_1.logger.info("Repository exists at " + this.cloneDirectory);
                            return [4 /*yield*/, this.getConfig('remote.origin.url')];
                        case 1:
                            repoUrl = _a.sent();
                            if (repoUrl !== url) {
                                throw new Error("Repository mismatch. Expected \"" + repoUrl + "\" to be \"" + url + "\".");
                            }
                            _a.label = 2;
                        case 2: return [4 /*yield*/, this.execSSHAgent('git', ['clone', url, this.cloneDirectory], { silent: false })];
                        case 3:
                            _a.sent();
                            this.url = url;
                            return [2 /*return*/];
                    }
                });
            });
        };
        Git.prototype.commit = function (message) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    return [2 /*return*/, this.execSSHAgent('git', ['commit', '-m', "\"" + message + "\""], { silent: false, cwd: this.cloneDirectory })];
                });
            });
        };
        Git.prototype.createOrphan = function (branch) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.cloneDirectory) {
                                throw new Error('A clone directory must be set');
                            }
                            return [4 /*yield*/, process_1.promiseExec("git checkout --orphan " + branch, { silent: true, cwd: this.cloneDirectory })];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, process_1.promiseExec('git rm -rf .', { silent: true, cwd: this.cloneDirectory })];
                        case 2:
                            _a.sent();
                            log_1.logger.info("Created \"" + branch + "\" branch");
                            return [2 /*return*/];
                    }
                });
            });
        };
        Git.prototype.ensureConfig = function (user, email) {
            if (user === void 0) { user = 'Travis CI'; }
            if (email === void 0) { email = 'support@sitepen.com'; }
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.hasConfig('user.name')];
                        case 1:
                            if (!!(_a.sent())) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.setConfig('user.name', user)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [4 /*yield*/, this.hasConfig('user.email')];
                        case 4:
                            if (!!(_a.sent())) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.setConfig('user.email', email)];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        Git.prototype.execSSHAgent = function (command, args, options) {
            if (options === void 0) { options = {}; }
            if (this.hasDeployCredentials()) {
                var deployKey = this.keyFile;
                var relativeDeployKey = options.cwd ? path_1.relative(options.cwd, deployKey) : deployKey;
                fs_1.chmodSync(deployKey, '600');
                return process_1.promiseExec("ssh-agent bash -c 'ssh-add " + relativeDeployKey + "; " + command + " " + args.join(' ') + "'", options);
            }
            else {
                log_1.logger.info("Deploy Key \"" + this.keyFile + "\" is not present. Using environment credentials for " + args[0] + ".");
                return process_1.promiseSpawn(command, args, options);
            }
        };
        Git.prototype.getConfig = function (key) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var proc;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, process_1.exec("git config " + key, { silent: true, cwd: this.cloneDirectory })];
                        case 1:
                            proc = _a.sent();
                            return [4 /*yield*/, streams_1.toString(proc.stdout)];
                        case 2: return [2 /*return*/, (_a.sent()).trim()];
                    }
                });
            });
        };
        Git.prototype.areFilesChanged = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var proc, changes;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, process_1.exec('git status --porcelain', { silent: true, cwd: this.cloneDirectory })];
                        case 1:
                            proc = _a.sent();
                            return [4 /*yield*/, streams_1.toString(proc.stdout)];
                        case 2:
                            changes = (_a.sent()).trim();
                            return [2 /*return*/, changes !== ''];
                    }
                });
            });
        };
        Git.prototype.hasConfig = function (key) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var value;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getConfig(key)];
                        case 1:
                            value = _a.sent();
                            return [2 /*return*/, !!value];
                    }
                });
            });
        };
        Git.prototype.hasDeployCredentials = function () {
            return fs_1.existsSync(this.keyFile);
        };
        Git.prototype.headRevision = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var proc;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, process_1.exec("git rev-parse HEAD", { silent: false, cwd: this.cloneDirectory })];
                        case 1:
                            proc = _a.sent();
                            return [4 /*yield*/, streams_1.toString(proc.stdout)];
                        case 2: return [2 /*return*/, (_a.sent()).trim()];
                    }
                });
            });
        };
        Git.prototype.pull = function () {
            return this.execSSHAgent('git', ['pull'], {
                cwd: this.cloneDirectory
            });
        };
        Git.prototype.push = function (branch, remote) {
            if (remote === void 0) { remote = 'origin'; }
            var params = branch ? ['push', remote, branch] : ['push'];
            return this.execSSHAgent('git', params, { silent: false, cwd: this.cloneDirectory });
        };
        Git.prototype.setConfig = function (key, value) {
            return process_1.promiseExec("git config --global " + key + " " + value, { silent: false });
        };
        return Git;
    }());
    exports.default = Git;
});
//# sourceMappingURL=Git.js.map