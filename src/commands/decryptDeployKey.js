(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../util/crypto", "../util/environment", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var crypto_1 = require("../util/crypto");
    var env = require("../util/environment");
    var fs_1 = require("fs");
    function decryptDeployKey(encryptedFile, key, iv, decryptedFile) {
        if (encryptedFile === void 0) { encryptedFile = env.encryptedKeyFile(); }
        if (key === void 0) { key = process.env[env.decryptKeyName()]; }
        if (iv === void 0) { iv = process.env[env.decryptIvName()]; }
        if (decryptedFile === void 0) { decryptedFile = env.keyFile(); }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                if (!fs_1.existsSync(encryptedFile) || fs_1.existsSync(decryptedFile) || !key || !iv) {
                    return [2 /*return*/, false];
                }
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var source = fs_1.createReadStream(encryptedFile);
                        var target = fs_1.createWriteStream(decryptedFile);
                        crypto_1.decryptData(source, key, iv)
                            .pipe(target)
                            .on('error', function (error) {
                            reject(error);
                        }).on('close', function () {
                            resolve(true);
                        });
                    })];
            });
        });
    }
    exports.default = decryptDeployKey;
    ;
});
//# sourceMappingURL=decryptDeployKey.js.map