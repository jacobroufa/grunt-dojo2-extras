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
        define(["require", "exports", "@dojo/core/request"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var request_1 = require("@dojo/core/request");
    function responseHandler(response) {
        var statusCode = response.status;
        if (statusCode < 200 || statusCode >= 300) {
            var message = response.statusText;
            throw new Error("Travis responded with " + statusCode + ". " + message);
        }
        return response;
    }
    function getHeaders(token) {
        var headers = {
            Accept: 'application/vnd.travis-ci.2+json',
            'Content-type': 'application/json',
            'User-Agent': 'MyClient/1.0.0'
        };
        if (token) {
            headers.Authorization = "token " + token;
        }
        return headers;
    }
    var Travis = (function () {
        function Travis() {
            this.token = null;
        }
        Travis.prototype.authenticate = function (githubToken) {
            return __awaiter(this, void 0, void 0, function () {
                var response, token;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, request_1.default.post('https://api.travis-ci.org/auth/github', {
                                body: JSON.stringify({
                                    'github_token': githubToken
                                }),
                                headers: getHeaders()
                            }).then(responseHandler)];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            token = (_a.sent()).access_token;
                            this.token = token;
                            return [2 /*return*/, token];
                    }
                });
            });
        };
        Travis.prototype.fetchRepository = function (slug) {
            return __awaiter(this, void 0, void 0, function () {
                var endpoint, response, body;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            endpoint = "https://api.travis-ci.org/repos/" + slug;
                            return [4 /*yield*/, request_1.default.get(endpoint, {
                                    headers: getHeaders(this.token)
                                }).then(responseHandler)];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            body = _a.sent();
                            return [2 /*return*/, new Repository(this.token, body.repo)];
                    }
                });
            });
        };
        return Travis;
    }());
    exports.default = Travis;
    var Repository = (function () {
        function Repository(token, repo) {
            this.active = !!repo.active;
            this.id = repo.id;
            this.slug = repo.slug;
            this.token = token;
        }
        Repository.prototype.listEnvironmentVariables = function () {
            return __awaiter(this, void 0, void 0, function () {
                var endpoint, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            endpoint = "https://api.travis-ci.org/settings/env_vars?repository_id=" + this.id;
                            return [4 /*yield*/, request_1.default.get(endpoint, {
                                    headers: getHeaders(this.token)
                                }).then(responseHandler)];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2: return [2 /*return*/, (_a.sent()).env_vars];
                    }
                });
            });
        };
        Repository.prototype.setEnvironmentVariables = function () {
            var variables = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                variables[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var envvars, _loop_1, this_1, _i, variables_1, _a, name_1, value, isPublic;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.listEnvironmentVariables()];
                        case 1:
                            envvars = _b.sent();
                            _loop_1 = function (name_1, value, isPublic) {
                                var match;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            match = envvars.find(function (envvar) {
                                                return envvar.name === name_1;
                                            });
                                            if (!match) return [3 /*break*/, 2];
                                            return [4 /*yield*/, this_1.updateEnvironmentVariable(match.id, name_1, value, isPublic)];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 4];
                                        case 2: return [4 /*yield*/, this_1.addEnvironmentVariable(name_1, value, isPublic)];
                                        case 3:
                                            _a.sent();
                                            _a.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            };
                            this_1 = this;
                            _i = 0, variables_1 = variables;
                            _b.label = 2;
                        case 2:
                            if (!(_i < variables_1.length)) return [3 /*break*/, 5];
                            _a = variables_1[_i], name_1 = _a.name, value = _a.value, isPublic = _a.isPublic;
                            return [5 /*yield**/, _loop_1(name_1, value, isPublic)];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        Repository.prototype.addEnvironmentVariable = function (name, value, isPublic) {
            if (isPublic === void 0) { isPublic = false; }
            return __awaiter(this, void 0, void 0, function () {
                var endpoint, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            endpoint = "https://api.travis-ci.org/settings/env_vars?repository_id=" + this.id;
                            return [4 /*yield*/, request_1.default.post(endpoint, {
                                    body: JSON.stringify({
                                        'env_var': {
                                            name: name,
                                            value: value,
                                            'public': isPublic
                                        }
                                    }),
                                    headers: getHeaders(this.token)
                                }).then(responseHandler)];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, response.json()];
                    }
                });
            });
        };
        Repository.prototype.updateEnvironmentVariable = function (id, name, value, isPublic) {
            if (isPublic === void 0) { isPublic = false; }
            return __awaiter(this, void 0, void 0, function () {
                var endpoint, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            endpoint = "https://api.travis-ci.org/settings/env_vars/" + id + "?repository_id=" + this.id;
                            return [4 /*yield*/, request_1.default(endpoint, {
                                    body: JSON.stringify({
                                        'env_var': {
                                            name: name,
                                            value: value,
                                            'public': isPublic
                                        }
                                    }),
                                    headers: getHeaders(this.token),
                                    method: 'patch'
                                }).then(responseHandler)];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, response.json()];
                    }
                });
            });
        };
        return Repository;
    }());
    exports.Repository = Repository;
});
//# sourceMappingURL=Travis.js.map