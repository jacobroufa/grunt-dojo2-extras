(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "winston", "stream"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var winston_1 = require("winston");
    var stream_1 = require("stream");
    exports.logger = new winston_1.Logger({
        level: 'debug',
        transports: [
            new winston_1.transports.Console({
                showLevel: false
            })
        ]
    });
    var LogStream = (function (_super) {
        tslib_1.__extends(LogStream, _super);
        function LogStream(level, opts) {
            if (level === void 0) { level = 'info'; }
            if (opts === void 0) { opts = undefined; }
            var _this = _super.call(this, opts) || this;
            _this.buffer = '';
            _this.level = level;
            return _this;
        }
        LogStream.prototype.end = function (chunk, encoding, cb) {
            _super.prototype.end.call(this, chunk, encoding, cb);
            if (this.buffer.length) {
                this.writeLog(this.buffer);
            }
            this.emit('end');
        };
        LogStream.prototype._write = function (chunk, encoding, callback) {
            if (encoding === 'buffer') {
                encoding = 'utf-8';
            }
            this.writeLogMultiline(typeof chunk === 'string' ? chunk : chunk.toString(encoding));
            callback && callback();
        };
        LogStream.prototype.writeLog = function (str) {
            exports.logger.log(this.level, str.trim());
        };
        LogStream.prototype.writeLogMultiline = function (chunk) {
            var pieces = (this.buffer + chunk).split('\n');
            this.buffer = pieces.pop();
            for (var _i = 0, pieces_1 = pieces; _i < pieces_1.length; _i++) {
                var str = pieces_1[_i];
                this.writeLog(str.trim());
            }
        };
        return LogStream;
    }(stream_1.Writable));
    exports.LogStream = LogStream;
    exports.default = exports.logger;
});
//# sourceMappingURL=log.js.map