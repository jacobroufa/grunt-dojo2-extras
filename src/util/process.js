(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "child_process", "../log"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var child_process_1 = require("child_process");
    var log_1 = require("../log");
    function promisify(proc) {
        return new Promise(function (resolve, reject) {
            proc.on('close', function (code) {
                if (code === 0) {
                    resolve(proc);
                }
                else {
                    process.exitCode = code;
                    reject(new Error("Process exited with a code of " + code));
                }
            });
        });
    }
    exports.promisify = promisify;
    function applyOptions(proc, options) {
        if (options.silent === false || options.display === true) {
            proc.stdout.pipe(new log_1.LogStream());
            proc.stderr.pipe(new log_1.LogStream('error'));
        }
    }
    function exec(command, options) {
        log_1.logger.debug("exec " + command);
        var proc = child_process_1.exec(command, options);
        applyOptions(proc, options);
        return proc;
    }
    exports.exec = exec;
    function promiseExec(command, options) {
        if (options === void 0) { options = {}; }
        options.silent = options.silent || false;
        return promisify(exec(command, options));
    }
    exports.promiseExec = promiseExec;
    function spawn(command, args, options) {
        log_1.logger.debug("spawn " + command + " " + (args ? args.join(' ') : ''));
        var proc = child_process_1.spawn(command, args, options);
        applyOptions(proc, options);
        return proc;
    }
    exports.spawn = spawn;
    function promiseSpawn(command, args, options) {
        if (options === void 0) { options = {}; }
        options.silent = options.silent || false;
        return promisify(spawn(command, args, options));
    }
    exports.promiseSpawn = promiseSpawn;
});
//# sourceMappingURL=process.js.map