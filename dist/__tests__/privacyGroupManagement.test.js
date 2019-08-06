"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
jest.setTimeout(15000);
var urlNode1 = "http://localhost:20000";
var providerNode1 = new index_1.providers.PrivateJsonRpcProvider(urlNode1);
providerNode1.on('debug', function (info) {
    console.log("Sent \"" + info.action + "\" action to node 1 with request: " + JSON.stringify(info.request) + "\nResponse: " + JSON.stringify(info.response));
});
var urlNode2 = "http://localhost:20002";
var providerNode2 = new index_1.providers.PrivateJsonRpcProvider(urlNode2);
providerNode2.on('debug', function (info) {
    console.log("Sent \"" + info.action + "\" action to node 2 with request: " + JSON.stringify(info.request) + "\nResponse: " + JSON.stringify(info.response));
});
var urlNode3 = "http://localhost:20004";
var providerNode3 = new index_1.providers.PrivateJsonRpcProvider(urlNode3);
providerNode3.on('debug', function (info) {
    console.log("Sent \"" + info.action + "\" action to node 3 with request: " + JSON.stringify(info.request) + "\nResponse: " + JSON.stringify(info.response));
});
var node1 = 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=';
var node2 = 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs=';
var node3 = 'k2zXEin4Ip/qBGlRkJejnGWdP9cjkK+DAvKNW31L2C8=';
var invalidNode = '00000000000000000000000000000000000000000001';
describe('Privacy Group Management APIs', function () {
    var node1EnodeUrl;
    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, providerNode1.send('net_enode', [])];
                case 1:
                    node1EnodeUrl = _a.sent();
                    console.log("enode url " + node1EnodeUrl + "\nnode1 public key: " + node1EnodeUrl.substring(9, 136));
                    return [2 /*return*/];
            }
        });
    }); });
    describe('privacy group management', function () {
        describe('Create, find and delete', function () {
            var firstPrivacyGroupId;
            var duplicatePrivacyGroupId;
            test('find no existing privacy groups', function () { return __awaiter(_this, void 0, void 0, function () {
                var results;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode2.findPrivacyGroup([node2, node3])];
                        case 1:
                            results = _a.sent();
                            expect(results).toHaveLength(0);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('Create privacy group for node2 and node3', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode2.createPrivacyGroup([node2, node3], 'Node2_3', 'Secret for node2 and node3')];
                        case 1:
                            firstPrivacyGroupId = _a.sent();
                            expect(firstPrivacyGroupId).toMatch(index_1.utils.RegEx.base64);
                            expect(firstPrivacyGroupId).toHaveLength(44);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('find privacy group from node2 that created it', function () { return __awaiter(_this, void 0, void 0, function () {
                var results;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode2.findPrivacyGroup([node2, node3])];
                        case 1:
                            results = _a.sent();
                            expect(results).toHaveLength(1);
                            expect(results[0].privacyGroupId).toEqual(firstPrivacyGroupId);
                            expect(results[0].name).toEqual('Node2_3');
                            expect(results[0].description).toEqual('Secret for node2 and node3');
                            expect(results[0].members).toEqual([node2, node3]);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('find privacy group from node3 that is a member', function () { return __awaiter(_this, void 0, void 0, function () {
                var results;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode3.findPrivacyGroup([node2, node3])];
                        case 1:
                            results = _a.sent();
                            expect(results).toHaveLength(1);
                            expect(results[0].privacyGroupId).toEqual(firstPrivacyGroupId);
                            expect(results[0].name).toEqual('Node2_3');
                            expect(results[0].description).toEqual('Secret for node2 and node3');
                            expect(results[0].members).toEqual([node2, node3]);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('find privacy group from node1 that is NOT a member', function () { return __awaiter(_this, void 0, void 0, function () {
                var results;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode1.findPrivacyGroup([node2, node3])];
                        case 1:
                            results = _a.sent();
                            expect(results).toHaveLength(0);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('find privacy group just for node2 and not node3', function () { return __awaiter(_this, void 0, void 0, function () {
                var results;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode1.findPrivacyGroup([node2])];
                        case 1:
                            results = _a.sent();
                            expect(results).toHaveLength(0);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('Duplicate privacy group', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode2.createPrivacyGroup([node2, node3], 'Node2_3', 'Secret for node2 and node3')];
                        case 1:
                            duplicatePrivacyGroupId = _a.sent();
                            expect(duplicatePrivacyGroupId).toMatch(index_1.utils.RegEx.base64);
                            expect(duplicatePrivacyGroupId).toHaveLength(44);
                            expect(duplicatePrivacyGroupId).toEqual(firstPrivacyGroupId);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('node1 can\'t delete a privacy group they are not a member of', function () { return __awaiter(_this, void 0, void 0, function () {
                var err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            expect.assertions(2);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, providerNode1.deletePrivacyGroup(firstPrivacyGroupId)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            err_1 = _a.sent();
                            expect(err_1).toBeInstanceOf(Error);
                            expect(err_1.message).toMatch(/Error deleting privacy group/);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            test('node2 deletes first privacy group', function () { return __awaiter(_this, void 0, void 0, function () {
                var deletedPrivacyGroupId, results;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode2.deletePrivacyGroup(firstPrivacyGroupId)];
                        case 1:
                            deletedPrivacyGroupId = _a.sent();
                            expect(deletedPrivacyGroupId).toEqual(firstPrivacyGroupId);
                            return [4 /*yield*/, providerNode2.findPrivacyGroup([node2, node3])];
                        case 2:
                            results = _a.sent();
                            expect(results).toHaveLength(1);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('deleted privacy group has propagated to node3', function () { return __awaiter(_this, void 0, void 0, function () {
                var results;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode3.findPrivacyGroup([node2, node3])];
                        case 1:
                            results = _a.sent();
                            expect(results).toHaveLength(1);
                            return [2 /*return*/];
                    }
                });
            }); });
            // TODO delete once create does not duplicate
            test('node3 deletes duplicate privacy group', function () { return __awaiter(_this, void 0, void 0, function () {
                var result, results;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode3.deletePrivacyGroup(duplicatePrivacyGroupId)];
                        case 1:
                            result = _a.sent();
                            expect(result).toEqual(duplicatePrivacyGroupId);
                            return [4 /*yield*/, providerNode3.findPrivacyGroup([node2, node3])];
                        case 2:
                            results = _a.sent();
                            expect(results).toHaveLength(0);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('deleted privacy group has propagated to node2', function () { return __awaiter(_this, void 0, void 0, function () {
                var results;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode2.findPrivacyGroup([node2, node3])];
                        case 1:
                            results = _a.sent();
                            expect(results).toHaveLength(0);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('Successful', function () {
            var privacyGroups = [];
            test.each(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n            reason  | name | description | members\n            ", " | ", " | ", " | ", "\n            ", " | ", " | ", " | ", "\n            ", " | ", " | ", " | ", "\n            "], ["\n            reason  | name | description | members\n            ", " | ", " | ", " | ", "\n            ", " | ", " | ", " | ", "\n            ", " | ", " | ", " | ", "\n            "])), 'all three nodes', 'Short name', 'Top secret stuff in this long description', [node1, node2, node3], 'duplicate', 'Short name', 'Top secret stuff in this long description', [node1, node2, node3], 'all three nodes diff name and desc', 'Second group', 'Second group with the same members', [node1, node2, node3])('$reason when name $name, description $description and members $members', function (_a) {
                var name = _a.name, description = _a.description, members = _a.members;
                return __awaiter(_this, void 0, void 0, function () {
                    var privacyGroupId;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, providerNode1.createPrivacyGroup(members, name, description)];
                            case 1:
                                privacyGroupId = _b.sent();
                                expect(privacyGroupId).toMatch(index_1.utils.RegEx.base64);
                                expect(privacyGroupId).toHaveLength(44);
                                privacyGroups.push(privacyGroupId);
                                return [2 /*return*/];
                        }
                    });
                });
            });
            test('delete each groups', function () {
                privacyGroups.forEach(function (privacyGroupId) { return __awaiter(_this, void 0, void 0, function () {
                    var result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode1.deletePrivacyGroup(privacyGroupId)];
                            case 1:
                                result = _a.sent();
                                expect(result).toEqual(privacyGroupId);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        });
        describe('Failed', function () {
            test.each(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n            reason | errorRegEx | name | description | members\n            ", " | ", " | ", " | ", " | ", "\n            ", " | ", " | ", " | ", " | ", "\n            ", " | ", " | ", " | ", " | ", "\n            ", " | ", " | ", " | ", " | ", "\n            ", " | ", " | ", " | ", " | ", "\n            "], ["\n            reason | errorRegEx | name | description | members\n            ", " | ", " | ", " | ", " | ", "\n            ", " | ", " | ", " | ", " | ", "\n            ", " | ", " | ", " | ", " | ", "\n            ", " | ", " | ", " | ", " | ", "\n            ", " | ", " | ", " | ", " | ", "\n            "])), 'members undefined', /Invalid params/, 'Test', 'Test desc', undefined, 'members empty array', /Error creating privacy group/, 'Test', 'Test desc', [], 'invalid node in members', /Error creating privacy group/, 'Test', 'Test desc', [node2, invalidNode], 'privateFrom not in members', /Error creating privacy group/, 'Second group', 'Second group with the same members', [node2, node3], 'only self in group', /Error creating privacy group/, 'Self', 'Only self in group', [node3])('$reason to fail with $errorRegEx when name $name, description $description and members $members', function (_a) {
                var privateFrom = _a.privateFrom, errorRegEx = _a.errorRegEx, name = _a.name, description = _a.description, members = _a.members;
                return __awaiter(_this, void 0, void 0, function () {
                    var err_2;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, providerNode1.createPrivacyGroup(members, name, description)];
                            case 1:
                                _b.sent();
                                expect(false).toBeTruthy();
                                return [3 /*break*/, 3];
                            case 2:
                                err_2 = _b.sent();
                                expect(err_2).toBeInstanceOf(Error);
                                expect(err_2.message).toMatch(errorRegEx);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                });
            });
        });
    });
});
var templateObject_1, templateObject_2;
