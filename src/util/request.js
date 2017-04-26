(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./streams", "@dojo/core/request", "@dojo/core/request/providers/node"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var streams_1 = require("./streams");
    var request_1 = require("@dojo/core/request");
    var node_1 = require("@dojo/core/request/providers/node");
    function responseHandler(response) {
        var statusCode = response.status;
        if (statusCode < 200 || statusCode >= 300) {
            var message_1 = response.statusText;
            return streams_1.toString(response.nativeResponse)
                .then(function (body) {
                throw new Error("Github responded with " + statusCode + ". " + message_1 + ". " + body);
            });
        }
        return response;
    }
    exports.responseHandler = responseHandler;
    function fixAuth(options) {
        if (options.password || options.user) {
            var credentials = new Buffer((options.user || '') + ":" + (options.password || '')).toString('base64');
            var headers = options.headers = options.headers || {};
            headers['Authorization'] = "Basic " + credentials;
            delete options.password;
            delete options.user;
        }
        return options;
    }
    exports.fixAuth = fixAuth;
    var provider = function (url, options) {
        return node_1.default(url, fixAuth(options));
    };
    request_1.default.setDefaultProvider(provider);
    exports.default = request_1.default;
});
//# sourceMappingURL=request.js.map