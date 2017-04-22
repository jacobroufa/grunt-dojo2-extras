(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "mockery"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var mockery = require("mockery");
    function loadModule(mid, mocks, returnDefault) {
        if (returnDefault === void 0) { returnDefault = true; }
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
        mockery.resetCache();
        for (var mid_1 in mocks) {
            mockery.registerMock(mid_1, mocks[mid_1]);
        }
        var loader = require.nodeRequire || require;
        var module = loader(require.toUrl(mid));
        return returnDefault && module.default ? module.default : module;
    }
    exports.default = loadModule;
    function cleanupModuleMocks() {
        mockery.deregisterAll();
        mockery.disable();
    }
    exports.cleanupModuleMocks = cleanupModuleMocks;
});
//# sourceMappingURL=loadModule.js.map