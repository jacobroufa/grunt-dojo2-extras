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
        define(["require", "exports", "@dojo/core/request", "./environment", "fs", "../util/streams"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var request_1 = require("@dojo/core/request");
    var environment_1 = require("./environment");
    var fs_1 = require("fs");
    var streams_1 = require("../util/streams");
    var API_URL = 'https://api.github.com';
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
    var GitHub = (function () {
        function GitHub(owner, name, options) {
            if (options === void 0) { options = {}; }
            if (!owner) {
                throw new Error('A repo owner must be specified');
            }
            if (!name) {
                throw new Error('A repo name must be specified');
            }
            this.owner = owner;
            this.name = name;
            this.authenticate(options.username, options.password);
        }
        Object.defineProperty(GitHub.prototype, "url", {
            get: function () {
                return environment_1.hasGitCredentials() ? this.getSshUrl() : this.getHttpsUrl();
            },
            enumerable: true,
            configurable: true
        });
        GitHub.prototype.createAuthorizationToken = function (note, scopes) {
            if (note === void 0) { note = ''; }
            if (scopes === void 0) { scopes = [
                'read:org', 'user:email', 'repo_deployment', 'repo:status', 'public_repo', 'write:repo_hook'
            ]; }
            return __awaiter(this, void 0, void 0, function () {
                var endpoint, options;
                return __generator(this, function (_a) {
                    this.assertAuthentication();
                    endpoint = "https://api.github.com/authorizations";
                    options = {
                        body: JSON.stringify({
                            scopes: scopes,
                            note: note
                        }),
                        password: this.password,
                        user: this.username,
                    };
                    return [2 /*return*/, request_1.default.post(endpoint, options).then(responseHandler)
                            .then(function (response) { return response.json(); })];
                });
            });
        };
        GitHub.prototype.removeAuthorizationToken = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var endpoint;
                return __generator(this, function (_a) {
                    endpoint = "https://api.github.com/authorizations/" + id;
                    return [2 /*return*/, request_1.default.delete(endpoint, {
                            password: this.password,
                            user: this.username
                        }).then(responseHandler)];
                });
            });
        };
        GitHub.prototype.addDeployKey = function (keyfile, title, readOnly) {
            if (readOnly === void 0) { readOnly = true; }
            this.assertAuthentication();
            var endpoint = "https://api.github.com/repos/" + this.owner + "/" + this.name + "/keys";
            var key = fs_1.readFileSync(keyfile, { encoding: 'utf8' });
            return request_1.default.post(endpoint, {
                body: JSON.stringify({
                    title: title,
                    key: key,
                    read_only: readOnly
                }),
                password: this.password,
                user: this.username
            }).then(responseHandler)
                .then(function (response) { return response.json(); });
        };
        GitHub.prototype.authenticate = function (username, password) {
            this.username = username;
            this.password = password;
        };
        GitHub.prototype.fetchReleases = function () {
            var url = API_URL + "/repos/" + this.owner + "/" + this.name + "/tags";
            return request_1.default(url)
                .then(responseHandler)
                .then(function (response) { return response.json(); });
        };
        GitHub.prototype.getHttpsUrl = function () {
            return "https://github.com/" + this.owner + "/" + this.name + ".git";
        };
        GitHub.prototype.getSshUrl = function () {
            return "git@github.com:" + this.owner + "/" + this.name + ".git";
        };
        GitHub.prototype.toString = function () {
            return this.owner + "/" + this.name;
        };
        GitHub.prototype.assertAuthentication = function () {
            if (!this.username) {
                throw new Error('Username must be provided');
            }
            if (!this.password) {
                throw new Error('Password must be provided');
            }
        };
        return GitHub;
    }());
    exports.default = GitHub;
});
//# sourceMappingURL=GitHub.js.map