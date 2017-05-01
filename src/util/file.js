(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "mkdirp", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fs_1 = require("fs");
    var mkdirp_1 = require("mkdirp");
    var path_1 = require("path");
    function makeTempDirectory(base, prefix) {
        if (prefix === void 0) { prefix = 'tmp-'; }
        if (!fs_1.existsSync(base)) {
            mkdirp_1.sync(base);
        }
        return fs_1.mkdtempSync(path_1.join(base, prefix));
    }
    exports.makeTempDirectory = makeTempDirectory;
});
//# sourceMappingURL=file.js.map