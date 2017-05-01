(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "intern!object", "intern/chai!assert", "src/util/file", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var registerSuite = require("intern!object");
    var assert = require("intern/chai!assert");
    var file_1 = require("src/util/file");
    var fs_1 = require("fs");
    registerSuite({
        name: 'file',
        tempDirectory: function () {
            var path = file_1.makeTempDirectory('./test');
            assert.isTrue(fs_1.existsSync(path));
            assert.isTrue(fs_1.statSync(path).isDirectory());
        }
    });
});
//# sourceMappingURL=file.js.map