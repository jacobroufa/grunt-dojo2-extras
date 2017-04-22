(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fs_1 = require("fs");
    function commitMessage() {
        return process.env.TRAVIS_COMMIT_MESSAGE;
    }
    exports.commitMessage = commitMessage;
    function currentBranch() {
        return process.env.TRAVIS_BRANCH;
    }
    exports.currentBranch = currentBranch;
    function decryptIvName() {
        return 'publish_deploy_iv';
    }
    exports.decryptIvName = decryptIvName;
    function decryptKeyName() {
        return 'publish_deploy_key';
    }
    exports.decryptKeyName = decryptKeyName;
    function encryptedKeyFile(file) {
        if (file === void 0) { file = keyFile(); }
        return process.env.ENCRYPTED_KEY_FILE || file + ".enc";
    }
    exports.encryptedKeyFile = encryptedKeyFile;
    function gitCommit() {
        return process.env.TRAVIS_COMMIT;
    }
    exports.gitCommit = gitCommit;
    function hasGitCredentials(keyFile) {
        if (process.env.hasOwnProperty('HAS_GIT_CREDENTIALS')) {
            return process.env.HAS_GIT_CREDENTIALS === 'true';
        }
        if (isRunningOnTravis()) {
            return hasKeyFile(keyFile);
        }
        return true;
    }
    exports.hasGitCredentials = hasGitCredentials;
    function hexoRootOverride() {
        return process.env.HEXO_ROOT;
    }
    exports.hexoRootOverride = hexoRootOverride;
    function hasKeyFile(file) {
        if (file === void 0) { file = keyFile(); }
        return fs_1.existsSync(file);
    }
    exports.hasKeyFile = hasKeyFile;
    function isCronJob() {
        return process.env.TRAVIS_EVENT_TYPE === 'cron';
    }
    exports.isCronJob = isCronJob;
    function isRunningOnTravis() {
        return !!process.env.TRAVIS_BRANCH;
    }
    exports.isRunningOnTravis = isRunningOnTravis;
    function keyFile() {
        return process.env.KEY_FILE || 'deploy_key';
    }
    exports.keyFile = keyFile;
    function publishMode(defaultValue) {
        if (defaultValue === void 0) { defaultValue = isRunningOnTravis() ? 'skip' : 'commit'; }
        return process.env.DEPLOY_DOCS || defaultValue;
    }
    exports.publishMode = publishMode;
    function repositorySource() {
        return process.env.PUBLISH_TARGET_REPO || process.env.TRAVIS_REPO_SLUG || '';
    }
    exports.repositorySource = repositorySource;
});
//# sourceMappingURL=environment.js.map