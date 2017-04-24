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
        define(["require", "exports", "path", "../util/process", "mkdirp", "../log", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var path_1 = require("path");
    var process_1 = require("../util/process");
    var mkdirp_1 = require("mkdirp");
    var log_1 = require("../log");
    var fs_1 = require("fs");
    function installDependencies(repoDir) {
        return __awaiter(this, void 0, void 0, function () {
            var typingsJson;
            return __generator(this, function (_a) {
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
        return __awaiter(this, void 0, void 0, function () {
            var themeDirectory, format, source, target, targetDir, targetFile, typedocBin, outputOption, command;
            return __generator(this, function (_a) {
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