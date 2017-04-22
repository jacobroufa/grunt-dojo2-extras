(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "path", "fs", "semver"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var path_1 = require("path");
    var fs_1 = require("fs");
    var semver = require("semver");
    function noopFilter() {
        return true;
    }
    function missingApis(directory, repo, filter) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var releases, filterMethod;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, repo.fetchReleases()];
                    case 1:
                        releases = (_a.sent())
                            .filter(function (release) {
                            return semver.clean(release.name);
                        }).sort(function (a, b) {
                            var left = semver.clean(a.name);
                            var right = semver.clean(b.name);
                            return semver.compare(left, right, true);
                        });
                        filterMethod = noopFilter;
                        if (filter === 'latest') {
                            return [2 /*return*/, releases.slice(-1)];
                        }
                        else if (typeof filter === 'string') {
                            filterMethod = function (release) {
                                var version = semver.clean(release.name);
                                return semver.satisfies(version, filter);
                            };
                        }
                        return [2 /*return*/, releases.filter(function (release) {
                                var path = path_1.join(directory, release.name);
                                return filterMethod(release) && !fs_1.existsSync(path);
                            })];
                }
            });
        });
    }
    exports.default = missingApis;
});
//# sourceMappingURL=missingApis.js.map