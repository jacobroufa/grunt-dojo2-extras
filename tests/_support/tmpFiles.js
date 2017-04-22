(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fs_1 = require("fs");
    var path_1 = require("path");
    function tmpDirectory() {
        if (!fs_1.existsSync('.test')) {
            fs_1.mkdirSync('.test');
        }
        return fs_1.mkdtempSync('.test/dir-');
    }
    exports.tmpDirectory = tmpDirectory;
    function tmpFile(name) {
        if (name === void 0) { name = String(Math.floor(Math.random() * 10000)); }
        var filename;
        do {
            filename = path_1.join(tmpDirectory(), name);
        } while (fs_1.existsSync(filename));
        return filename;
    }
    exports.tmpFile = tmpFile;
});
//# sourceMappingURL=tmpFiles.js.map