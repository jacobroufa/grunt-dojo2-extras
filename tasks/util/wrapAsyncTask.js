(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../src/log"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var log_1 = require("../../src/log");
    function wrapAsyncTask(task) {
        return function () {
            var done = this.async();
            task.call(this).then(done, function (e) {
                if (e) {
                    log_1.logger.error(e.message);
                }
                done(false);
            });
        };
    }
    exports.default = wrapAsyncTask;
});
//# sourceMappingURL=wrapAsyncTask.js.map