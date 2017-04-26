var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
        define(["require", "exports", "path", "mkdirp", "../log", "typedoc", "util", "fs", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var path_1 = require("path");
    var mkdirp_1 = require("mkdirp");
    var log_1 = require("../log");
    var typedoc_1 = require("typedoc");
    var util_1 = require("util");
    var fs_1 = require("fs");
    var typescript_1 = require("typescript");
    var Typedoc = (function (_super) {
        __extends(Typedoc, _super);
        function Typedoc() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Typedoc.prototype.bootstrap = function (options) {
            return this.bootstrapResult = _super.prototype.bootstrap.call(this, options);
        };
        Typedoc.prototype.generateJson = function (project, out) {
            mkdirp_1.sync(path_1.dirname(out));
            return _super.prototype.generateJson.call(this, project, out);
        };
        Typedoc.prototype.generateDocs = function (project, out) {
            mkdirp_1.sync(out);
            return _super.prototype.generateDocs.call(this, project, out);
        };
        return Typedoc;
    }(typedoc_1.Application));
    function setOptions(source, options) {
        options = Object.assign({
            module: 'umd',
            target: 'ES5'
        }, options);
        if (options.tsconfig !== false) {
            if (typeof options.tsconfig !== 'string') {
                var config = typescript_1.findConfigFile(source, fs_1.existsSync);
                options.tsconfig = config;
            }
        }
        else {
            delete options.tsconfig;
            if (fs_1.statSync(source).isDirectory()) {
                log_1.logger.warn('typedoc cannot parse a directory without a tsconfig.json');
            }
        }
        log_1.logger.debug("Typedoc Options " + util_1.inspect(options));
        return options;
    }
    function typedoc(source, target, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var doc, files;
            return __generator(this, function (_a) {
                log_1.logger.info("Building API Documentation for \"" + source + "\" to \"" + target + "\"");
                options = setOptions(source, options);
                doc = new Typedoc(options);
                files = doc.expandInputFiles(doc.bootstrapResult.inputFiles);
                log_1.logger.debug("Processing files " + util_1.inspect(files));
                if (path_1.extname(target) === '.json') {
                    doc.generateJson(files, target);
                }
                else {
                    doc.generateDocs(files, target);
                }
                return [2 /*return*/];
            });
        });
    }
    exports.default = typedoc;
});
//# sourceMappingURL=typedoc.js.map