var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "intern!object", "intern/chai!assert", "../../../_support/loadModule", "sinon", "../../../../src/commands/getReleases"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var registerSuite = require("intern!object");
    var assert = require("intern/chai!assert");
    var loadModule_1 = require("../../../_support/loadModule");
    var sinon_1 = require("sinon");
    var getReleases_1 = require("../../../../src/commands/getReleases");
    var module;
    var existsSyncStub;
    function assertExistsFilter(builder, expected, filename) {
        var filter = builder('project', 'directory');
        existsSyncStub.returns(expected);
        assert.strictEqual(filter({ name: 'version' }), expected);
        assert.isTrue(existsSyncStub.called, 'existSync was not called');
        assert.strictEqual(existsSyncStub.firstCall.args[0], filename);
    }
    registerSuite({
        name: 'getReleases',
        before: function () {
            existsSyncStub = sinon_1.stub();
        },
        after: function () {
            loadModule_1.cleanupModuleMocks();
        },
        beforeEach: function () {
            module = loadModule_1.default('src/commands/getReleases', {
                fs: {
                    existsSync: existsSyncStub
                }
            }, false);
        },
        afterEach: function () {
            existsSyncStub.reset();
        },
        getHtmlApiPath: function () {
            assert.strictEqual(getReleases_1.getHtmlApiPath('base', 'project', 'version'), 'base/project/version');
        },
        getJsonApiPath: function () {
            assert.strictEqual(getReleases_1.getJsonApiPath('base', 'project', 'version'), 'base/project-version.json');
        },
        filters: {
            createHtmlExistsFilter: {
                'exists; returns true': function () {
                    var createHtmlExistsFilter = module.createHtmlExistsFilter;
                    assertExistsFilter(createHtmlExistsFilter, true, 'directory/project/version');
                },
                'does not exist; returns false': function () {
                    var createHtmlExistsFilter = module.createHtmlExistsFilter;
                    assertExistsFilter(createHtmlExistsFilter, true, 'directory/project/version');
                }
            },
            createJsonExistsFilter: {
                'exists; returns true': function () {
                    var createJsonExistsFilter = module.createJsonExistsFilter;
                    assertExistsFilter(createJsonExistsFilter, true, 'directory/project-version.json');
                },
                'does not exist; returns false': function () {
                    var createJsonExistsFilter = module.createJsonExistsFilter;
                    assertExistsFilter(createJsonExistsFilter, false, 'directory/project-version.json');
                }
            },
            latestFilter: function () {
                var latestFilter = module.latestFilter;
                var list = ['one', 'two', 'three'];
                assert.deepEqual(list.filter(latestFilter), ['one']);
            },
            createVersionFilter: {
                'satisfies semver; returns true': function () {
                    var createVersionFilter = module.createVersionFilter;
                    var filter = createVersionFilter('>= 2.0.0');
                    assert.isTrue(filter({ name: '2.0.0' }));
                },
                'does not satisfy semver; returns false': function () {
                    var createVersionFilter = module.createVersionFilter;
                    var filter = createVersionFilter('< 2.0.0');
                    assert.isFalse(filter({ name: '2.0.0' }));
                }
            }
        },
        getReleases: (function () {
            var getReleases;
            var mockGitHub;
            return {
                before: function () {
                    getReleases = module.default;
                    mockGitHub = {
                        fetchReleases: function () {
                            return Promise.resolve([
                                { name: 'one' },
                                { name: '2.0.0' },
                                { name: '1.6.5' },
                                { name: '3.0.0-beta' }
                            ]);
                        }
                    };
                },
                'removes version not compatible with semver': function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var releases, expected;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getReleases(mockGitHub)];
                                case 1:
                                    releases = _a.sent();
                                    expected = [
                                        { name: '1.6.5' },
                                        { name: '2.0.0' },
                                        { name: '3.0.0-beta' }
                                    ];
                                    assert.deepEqual(releases, expected);
                                    return [2 /*return*/];
                            }
                        });
                    });
                },
                'applies filters': function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var filter, releases, expected;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    filter = function (release) {
                                        return release.name === '2.0.0';
                                    };
                                    return [4 /*yield*/, getReleases(mockGitHub, [filter])];
                                case 1:
                                    releases = _a.sent();
                                    expected = [
                                        { name: '2.0.0' }
                                    ];
                                    assert.deepEqual(releases, expected);
                                    return [2 /*return*/];
                            }
                        });
                    });
                }
            };
        })()
    });
});
//# sourceMappingURL=getReleases.js.map