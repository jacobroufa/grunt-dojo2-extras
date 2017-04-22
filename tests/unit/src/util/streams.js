(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "intern!object", "intern/chai!assert", "src/util/streams", "stream", "events"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var registerSuite = require("intern!object");
    var assert = require("intern/chai!assert");
    var streams = require("src/util/streams");
    var stream_1 = require("stream");
    var events_1 = require("events");
    function assertReject(promise) {
        return promise.then(function () {
            throw new Error('expected rejection');
        }, function () {
            return;
        });
    }
    function createStream(data) {
        var stream = new stream_1.Readable();
        stream.push(data);
        stream.push(null);
        return stream;
    }
    registerSuite({
        name: 'util/streams',
        toString: {
            'stream is not readable; rejects': function () {
                var mock = {
                    readable: false,
                    isPaused: function () {
                        return false;
                    }
                };
                return assertReject(streams.toString(mock));
            },
            'stream throws error; rejects': function () {
                var mock = new events_1.EventEmitter();
                mock.readable = true;
                var promise = assertReject(streams.toString(mock));
                mock.emit('error', new Error());
                return promise;
            },
            'stream is converted to a string': function () {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    var expected, stream, value;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                expected = 'Hello World';
                                stream = createStream(expected);
                                return [4 /*yield*/, streams.toString(stream)];
                            case 1:
                                value = _a.sent();
                                assert.strictEqual(value, expected);
                                return [2 /*return*/];
                        }
                    });
                });
            }
        },
        equal: {
            'stream a errors; rejects': function () {
                var mock = new events_1.EventEmitter();
                var b = new stream_1.Readable();
                var promise = assertReject(streams.equal(mock, b));
                mock.emit('error', new Error());
                return promise;
            },
            'stream b errors; rejects': function () {
                var a = new stream_1.Readable();
                var mock = new events_1.EventEmitter();
                var promise = assertReject(streams.equal(a, mock));
                mock.emit('error', new Error());
                return promise;
            },
            'stream a is longer than stream b; rejects': function () {
                var a = createStream('Hello World');
                var b = createStream('Hello');
                return assertReject(streams.equal(a, b));
            },
            'stream b is longer than stream a; rejects': function () {
                var b = createStream('Hello World');
                var a = createStream('Hello');
                return assertReject(streams.equal(a, b));
            },
            'stream a is different than stream b; rejects': function () {
                var b = createStream('Hello World');
                var a = createStream('Hola World!');
                return assertReject(streams.equal(a, b));
            },
            'streams are identical; resolves': function () {
                var b = createStream('Hello World');
                var a = createStream('Hello World');
                return streams.equal(a, b);
            }
        }
    });
});
//# sourceMappingURL=streams.js.map