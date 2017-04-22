(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../log", "fs", "../util/crypto", "../util/Travis", "../util/streams", "../util/environment"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var log_1 = require("../log");
    var fs_1 = require("fs");
    var crypto_1 = require("../util/crypto");
    var Travis_1 = require("../util/Travis");
    var streams_1 = require("../util/streams");
    var env = require("../util/environment");
    function setupAutomation(repo, deployKeyFile, encryptedKeyFile) {
        if (deployKeyFile === void 0) { deployKeyFile = env.keyFile(); }
        if (encryptedKeyFile === void 0) { encryptedKeyFile = env.encryptedKeyFile(deployKeyFile); }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            function setup() {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    var keys, enc, travis, travisRepo;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                log_1.logger.info("Setting up auto publish for " + repo.toString());
                                if (fs_1.existsSync(deployKeyFile)) {
                                    throw new Error('Deploy key already exists');
                                }
                                log_1.logger.info('Creating a deployment key');
                                return [4 /*yield*/, crypto_1.createDeployKey(deployKeyFile)];
                            case 1:
                                keys = _a.sent();
                                log_1.logger.info('Encrypting deployment key');
                                enc = crypto_1.encryptData(fs_1.createReadStream(keys.privateKey));
                                return [4 /*yield*/, new Promise(function (resolve) {
                                        enc.encrypted.pipe(fs_1.createWriteStream(encryptedKeyFile))
                                            .on('close', function () {
                                            resolve();
                                        });
                                    })];
                            case 2:
                                _a.sent();
                                log_1.logger.info('Creating a temporary authorization token in GitHub for Travis');
                                return [4 /*yield*/, repo.createAuthorizationToken('temporary token for travis cli')];
                            case 3:
                                auth = _a.sent();
                                travis = new Travis_1.default();
                                log_1.logger.info('Authenticating with Travis');
                                return [4 /*yield*/, travis.authenticate(auth.token)];
                            case 4:
                                _a.sent();
                                log_1.logger.debug('Fetching Travis repository information');
                                return [4 /*yield*/, travis.fetchRepository(repo.toString())];
                            case 5:
                                travisRepo = _a.sent();
                                log_1.logger.info('Registering environment variables');
                                return [4 /*yield*/, travisRepo.setEnvironmentVariables({ name: env.decryptKeyName(), value: enc.key, isPublic: false }, { name: env.decryptIvName(), value: enc.iv, isPublic: false })];
                            case 6:
                                _a.sent();
                                log_1.logger.info("Confirm decrypt deploy key");
                                return [4 /*yield*/, streams_1.equal(crypto_1.decryptData(fs_1.createReadStream(encryptedKeyFile), enc.key, enc.iv), fs_1.createReadStream(keys.privateKey))];
                            case 7:
                                _a.sent();
                                log_1.logger.info('Adding deployment key to GitHub');
                                return [4 /*yield*/, repo.addDeployKey(keys.publicKey, 'Auto-created Travis Deploy Key', false)];
                            case 8:
                                _a.sent();
                                log_1.logger.info('');
                                log_1.logger.info("A new encrypted deploy key has been created at " + encryptedKeyFile + ".");
                                log_1.logger.info("Please commit this to your GitHub repository. The unencrypted keys \"" + keys.publicKey + "\"");
                                log_1.logger.info("and \"" + keys.privateKey + "\" may be deleted.");
                                log_1.logger.info("Variables to decrypt this key have been added to your Travis repository with the name");
                                log_1.logger.info("\"" + env.decryptKeyName() + " and " + env.decryptIvName() + ".");
                                log_1.logger.info('To begin publishing this site please add the DEPLOY_DOCS environment variable to Travis');
                                log_1.logger.info('and set its value to "publish"');
                                return [2 /*return*/, {
                                        decipher: {
                                            key: enc.key,
                                            iv: enc.iv
                                        },
                                        keys: {
                                            encryptedKey: encryptedKeyFile,
                                            publicKey: keys.publicKey,
                                            privateKey: keys.privateKey
                                        }
                                    }];
                        }
                    });
                });
            }
            function cleanup() {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(repo && auth)) return [3 /*break*/, 2];
                                log_1.logger.info('Removing temporary authorization token from GitHub');
                                return [4 /*yield*/, repo.removeAuthorizationToken(auth.id)];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                });
            }
            var auth, promise;
            return tslib_1.__generator(this, function (_a) {
                auth = null;
                promise = setup();
                return [2 /*return*/, promise.then(cleanup, cleanup).then(function () { return promise; })];
            });
        });
    }
    exports.default = setupAutomation;
});
//# sourceMappingURL=initAutomation.js.map