(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../src/util/environment"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var environment_1 = require("../../src/util/environment");
    function getGithubSlug(options, grunt) {
        var repoOption = (grunt && grunt.option('repo')) || (options && options.repo) || environment_1.repositorySource();
        var _a = repoOption ? repoOption.split('/') : [undefined, undefined], owner = _a[0], name = _a[1];
        return {
            name: name,
            owner: owner
        };
    }
    exports.default = getGithubSlug;
});
//# sourceMappingURL=getGithubSlug.js.map