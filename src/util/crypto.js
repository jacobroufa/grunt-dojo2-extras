(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "crypto", "./process", "./environment"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var crypto = require("crypto");
    var process_1 = require("./process");
    var env = require("./environment");
    function randomUtf8(bytes) {
        return crypto.randomBytes(bytes).toString('hex').slice(0, bytes);
    }
    function createDeployKey(deployKeyFile, keyComment) {
        if (deployKeyFile === void 0) { deployKeyFile = env.keyFile(); }
        if (keyComment === void 0) { keyComment = 'Automated Travis Deploy Key'; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var command, proc;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = "ssh-keygen -t rsa -b 4096 -C \"" + keyComment + "\" -f " + deployKeyFile + " -N \"\"";
                        proc = process_1.exec(command, { silent: false });
                        return [4 /*yield*/, process_1.promisify(proc)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, {
                                publicKey: deployKeyFile + ".pub",
                                privateKey: deployKeyFile
                            }];
                }
            });
        });
    }
    exports.createDeployKey = createDeployKey;
    function decryptData(data, key, iv) {
        var decipher = crypto.createDecipheriv('AES-256-CBC', key, iv);
        return data.pipe(decipher);
    }
    exports.decryptData = decryptData;
    function encryptData(data, key, iv) {
        if (key === void 0) { key = randomUtf8(32); }
        if (iv === void 0) { iv = randomUtf8(16); }
        var cipher = crypto.createCipheriv('AES-256-CBC', key, iv);
        return {
            encrypted: data.pipe(cipher),
            iv: iv,
            key: key
        };
    }
    exports.encryptData = encryptData;
});
//# sourceMappingURL=crypto.js.map