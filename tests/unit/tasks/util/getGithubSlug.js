(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "intern!object", "intern/chai!assert", "tasks/util/getGithubSlug", "sinon"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var registerSuite = require("intern!object");
    var assert = require("intern/chai!assert");
    var getGithubSlug_1 = require("tasks/util/getGithubSlug");
    var sinon_1 = require("sinon");
    function assertEnvironment(key) {
        process.env[key] = 'devpaul/dojo.io';
        var _a = getGithubSlug_1.default(), name = _a.name, owner = _a.owner;
        assert.strictEqual(owner, 'devpaul');
        assert.strictEqual(name, 'dojo.io');
    }
    var processCache;
    registerSuite({
        name: 'getGithubSlug',
        beforeEach: function () {
            processCache = {
                TRAVIS_REPO_SLUG: process.env.TRAVIS_REPO_SLUG,
                PUBLISH_TARGET_REPO: process.env.PUBLISH_TARGET_REPO
            };
            delete process.env.TRAVIS_REPO_SLUG;
            delete process.env.PUBLISH_TARGET_REPO;
        },
        afterEach: function () {
            for (var key in processCache) {
                process.env[key] = processCache[key];
            }
        },
        'grunt repo option': function () {
            var gruntMock = {
                option: sinon_1.stub().returns('devpaul/dojo.io')
            };
            var _a = getGithubSlug_1.default(null, gruntMock), name = _a.name, owner = _a.owner;
            assert.strictEqual(owner, 'devpaul');
            assert.strictEqual(name, 'dojo.io');
        },
        'options repo': function () {
            var _a = getGithubSlug_1.default({ repo: 'devpaul/dojo.io' }), name = _a.name, owner = _a.owner;
            assert.strictEqual(owner, 'devpaul');
            assert.strictEqual(name, 'dojo.io');
        },
        'PUBLISH_TARGET_REPO environment variable': function () {
            assertEnvironment('PUBLISH_TARGET_REPO');
        },
        'TRAVIS_REPO_SLUG environment variable': function () {
            assertEnvironment('TRAVIS_REPO_SLUG');
        },
        'no repo option': function () {
            var _a = getGithubSlug_1.default(), name = _a.name, owner = _a.owner;
            assert.isUndefined(name);
            assert.isUndefined(owner);
        }
    });
});
//# sourceMappingURL=getGithubSlug.js.map