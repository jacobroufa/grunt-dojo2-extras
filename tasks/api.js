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
        define(["require", "exports", "../src/commands/typedoc", "./util/wrapAsyncTask", "../src/util/GitHub", "../src/commands/sync", "../src/commands/getReleases", "path", "fs", "../src/commands/installDependencies", "../src/log"], factory);
    }
})(function (require, exports) {
    "use strict";
    var typedoc_1 = require("../src/commands/typedoc");
    var wrapAsyncTask_1 = require("./util/wrapAsyncTask");
    var GitHub_1 = require("../src/util/GitHub");
    var sync_1 = require("../src/commands/sync");
    var getReleases_1 = require("../src/commands/getReleases");
    var path_1 = require("path");
    var fs_1 = require("fs");
    var installDependencies_1 = require("../src/commands/installDependencies");
    var log_1 = require("../src/log");
    function isRemoteOptions(options) {
        return !!options.repo;
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
    function getMissing(repo, options) {
        return __awaiter(this, void 0, void 0, function () {
            var filters;
            return __generator(this, function (_a) {
                filters = getFilterOptions(options.filter);
                if (options.format === 'json') {
                    filters.push(getReleases_1.createJsonApiMissingFilter(repo.name, options.dest));
                }
                else {
                    filters.push(getReleases_1.createHtmlApiMissingFilter(repo.name, options.dest));
                }
                return [2 /*return*/, getReleases_1.default(repo, filters)];
            });
        });
    }
    function getFilterOptions(filter) {
        if (!filter) {
            return [];
        }
        if (filter === 'latest') {
            return [getReleases_1.latestFilter];
        }
        if (typeof filter === 'string') {
            return [getReleases_1.createVersionFilter(filter)];
        }
        if (Array.isArray(filter)) {
            return filter;
        }
        return [filter];
    }
    function createTempDirectory(name) {
        if (name === void 0) { name = ''; }
        return fs_1.mkdtempSync(path_1.join('.sync', name));
    }
    function createTypedocOptions(options, target, source) {
        var typedocOptions = Object.assign({}, options.typedoc, {
            source: source
        });
        if (options.format === 'json') {
            typedocOptions.json = target;
        }
        else {
            typedocOptions.out = target;
        }
        return typedocOptions;
    }
    return function (grunt) {
        function typedocTask() {
            return __awaiter(this, void 0, void 0, function () {
                var options, src, dest, format, repo, cloneDirectory, missing, pathTemplate, _i, missing_1, release, target;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            options = this.options({
                                format: 'html',
                                typedoc: {
                                    mode: 'file',
                                    externalPattern: '**/+(example|examples|node_modules|tests|typings)/**/*.ts',
                                    excludeExternals: true,
                                    excludeNotExported: true,
                                    ignoreCompilerErrors: true
                                }
                            });
                            src = options.src, dest = options.dest, format = options.format;
                            if (!isRemoteOptions(options)) return [3 /*break*/, 9];
                            repo = getGitHub(options.repo);
                            cloneDirectory = options.cloneDirectory ? options.cloneDirectory : createTempDirectory(repo.name);
                            return [4 /*yield*/, getMissing(repo, options)];
                        case 1:
                            missing = _a.sent();
                            pathTemplate = format === 'json' ? getReleases_1.getJsonApiPath : getReleases_1.getHtmlApiPath;
                            if (missing.length === 0) {
                                if (options.filter) {
                                    log_1.logger.info("No APIs match the filter: \"" + options.filter);
                                }
                                else {
                                    log_1.logger.info("all APIs are up-to-date.");
                                }
                                return [2 /*return*/];
                            }
                            _i = 0, missing_1 = missing;
                            _a.label = 2;
                        case 2:
                            if (!(_i < missing_1.length)) return [3 /*break*/, 8];
                            release = missing_1[_i];
                            target = pathTemplate(dest, repo.name, release.name);
                            return [4 /*yield*/, sync_1.default({
                                    branch: release.name,
                                    cloneDirectory: cloneDirectory,
                                    url: repo.url
                                })];
                        case 3:
                            _a.sent();
                            if (!(options.skipInstall !== true)) return [3 /*break*/, 5];
                            return [4 /*yield*/, installDependencies_1.default(cloneDirectory)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5: return [4 /*yield*/, typedoc_1.default(createTypedocOptions(options, target, cloneDirectory))];
                        case 6:
                            _a.sent();
                            _a.label = 7;
                        case 7:
                            _i++;
                            return [3 /*break*/, 2];
                        case 8: return [3 /*break*/, 13];
                        case 9:
                            if (!(options.skipInstall === false)) return [3 /*break*/, 11];
                            return [4 /*yield*/, installDependencies_1.default(src)];
                        case 10:
                            _a.sent();
                            _a.label = 11;
                        case 11: return [4 /*yield*/, typedoc_1.default(createTypedocOptions(options, dest, src))];
                        case 12:
                            _a.sent();
                            _a.label = 13;
                        case 13: return [2 /*return*/];
                    }
                });
            });
        }
        grunt.registerMultiTask('api', wrapAsyncTask_1.default(typedocTask));
    };
});
//# sourceMappingURL=api.js.map