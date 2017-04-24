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
        define(["require", "exports", "intern!object", "intern/chai!assert", "src/util/streams", "stream", "events"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
                return __awaiter(this, void 0, void 0, function () {
                    var expected, stream, value;
                    return __generator(this, function (_a) {
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