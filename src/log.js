var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "winston", "stream"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var winston_1 = require("winston");
    var stream_1 = require("stream");
    exports.logger = new winston_1.Logger({
        level: 'info',
        transports: [
            new winston_1.transports.Console({
                showLevel: false
            })
        ]
    });
    var LogStream = (function (_super) {
        __extends(LogStream, _super);
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