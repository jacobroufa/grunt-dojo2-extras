(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function toString(stream) {
        if (!stream.readable) {
            return Promise.reject(new Error('stream is not readable'));
        }
        return new Promise(function (resolve, reject) {
            var chunks = [];
            stream.on('data', function (chunk) {
                chunks.push(chunk);
            }).on('error', function (error) {
                reject(error);
            }).on('close', function () {
                resolve(chunks.join());
            }).on('end', function () {
                resolve(chunks.join());
            });
        });
    }
    exports.toString = toString;
    function equal(aStream, bStream) {
        return new Promise(function (resolve, reject) {
            var a = addListeners(aStream);
            var b = addListeners(bStream);
            var comparedLength = 0;
            function addListeners(stream) {
                var data = {
                    data: '',
                    closed: false
                };
                stream.on('data', function (chunk) {
                    data.data += String(chunk);
                    compare();
                }).on('error', function (error) {
                    reject(error);
                }).on('close', function () {
                    data.closed = true;
                    closed(data);
                }).on('end', function () {
                    data.closed = true;
                    closed(data);
                });
                return data;
            }
            function compare() {
                var max = Math.min(a.data.length, b.data.length);
                var toCompare = max - comparedLength;
                for (var i = 0; i < toCompare; i++) {
                    if (a.data.charAt(i) !== b.data.charAt(i)) {
                        reject(new Error("Difference at " + comparedLength + " " + a.data.charAt(i) + ":" + b.data.charAt(i)));
                    }
                    comparedLength++;
                }
            }
            function closed(data) {
                data.closed = true;
                compare();
                if (a.data.length > comparedLength || b.data.length > comparedLength) {
                    reject(new Error("Difference at " + comparedLength));
                }
                if (a.closed && b.closed) {
                    resolve();
                }
            }
        });
    }
    exports.equal = equal;
});
//# sourceMappingURL=streams.js.map