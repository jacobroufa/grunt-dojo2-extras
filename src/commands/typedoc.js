(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "path", "../util/process", "mkdirp", "../log", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var path_1 = require("path");
    var process_1 = require("../util/process");
    var mkdirp_1 = require("mkdirp");
    var log_1 = require("../log");
    var fs_1 = require("fs");
    function installDependencies(repoDir) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var typingsJson;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log_1.logger.info('Installing dependencies');
                        typingsJson = path_1.join(repoDir, 'typings.json');
                        return [4 /*yield*/, process_1.promiseExec('npm install', { silent: false, cwd: repoDir })];
                    case 1:
                        _a.sent();
                        if (!fs_1.existsSync(typingsJson)) return [3 /*break*/, 3];
                        return [4 /*yield*/, process_1.promiseExec('typings install', { silent: false, cwd: repoDir })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, typingsJson];
                }
            });
        });
    }
    ;
    function typedoc(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var themeDirectory, format, source, target, targetDir, targetFile, typedocBin, outputOption, command;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        themeDirectory = options.themeDirectory, format = options.format, source = options.source, target = options.target;
                        targetDir = format === 'json' ? path_1.dirname(target) : target;
                        targetFile = format === 'json' ? path_1.basename(target) || 'api.json' : null;
                        typedocBin = require.resolve('typedoc/bin/typedoc');
                        log_1.logger.info('Building API Documentation');
                        mkdirp_1.sync(targetDir);
                        return [4 /*yield*/, installDependencies(source)];
                    case 1:
                        _a.sent();
                        if (format === 'json') {
                            outputOption = "--json " + path_1.join(targetDir, targetFile);
                        }
                        else {
                            outputOption = "--out " + target;
                            if (themeDirectory) {
                                outputOption += " --theme " + themeDirectory;
                            }
                        }
                        command = typedocBin + " --mode file " + source + " " + outputOption + " --externalPattern '**/+(example|examples|node_modules|tests|typings)/**/*.ts' --excludeExternals --excludeNotExported --ignoreCompilerErrors";
                        return [4 /*yield*/, process_1.promiseExec(command)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.default = typedoc;
    ;
});
//# sourceMappingURL=typedoc.js.map