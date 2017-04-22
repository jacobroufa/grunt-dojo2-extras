(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "intern!object", "intern/chai!assert", "stream", "fs", "../../../_support/tmpFiles", "src/util/crypto"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var registerSuite = require("intern!object");
    var assert = require("intern/chai!assert");
    var stream_1 = require("stream");
    var fs_1 = require("fs");
    var tmpFiles_1 = require("../../../_support/tmpFiles");
    var crypto = require("src/util/crypto");
    registerSuite({
        name: 'util/crypto',
        createDeployKey: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var tmp, keys;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tmp = tmpFiles_1.tmpFile('deployKey');
                            return [4 /*yield*/, crypto.createDeployKey(tmp)];
                        case 1:
                            keys = _a.sent();
                            assert.isTrue(fs_1.existsSync(keys.publicKey));
                            assert.isTrue(fs_1.existsSync(keys.privateKey));
                            return [2 /*return*/];
                    }
                });
            });
        },
        encrypt: function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var expected, result;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            expected = 'Hello World!';
                            return [4 /*yield*/, new Promise(function (resolve) {
                                    var out = '';
                                    var stream = new stream_1.Readable();
                                    stream.push(expected);
                                    stream.push(null);
                                    var enc = crypto.encryptData(stream);
                                    crypto.decryptData(enc.encrypted, enc.key, enc.iv)
                                        .on('data', function (chunk) {
                                        out += chunk;
                                    })
                                        .on('end', function () {
                                        resolve(out);
                                    });
                                })];
                        case 1:
                            result = _a.sent();
                            assert.strictEqual(result, expected);
                            return [2 /*return*/];
                    }
                });
            });
        }
    });
});
//# sourceMappingURL=crypto.js.map