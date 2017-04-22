(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@dojo/core/request"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var response, token;
                return tslib_1.__generator(this, function (_a) {
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var endpoint, response, body;
                return tslib_1.__generator(this, function (_a) {
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var endpoint, response;
                return tslib_1.__generator(this, function (_a) {
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var envvars, _loop_1, this_1, _i, variables_1, _a, name_1, value, isPublic;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.listEnvironmentVariables()];
                        case 1:
                            envvars = _b.sent();
                            _loop_1 = function (name_1, value, isPublic) {
                                var match;
                                return tslib_1.__generator(this, function (_a) {
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var endpoint, response;
                return tslib_1.__generator(this, function (_a) {
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var endpoint, response;
                return tslib_1.__generator(this, function (_a) {
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