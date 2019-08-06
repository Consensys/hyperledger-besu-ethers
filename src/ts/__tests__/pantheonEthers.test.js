"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var PantheonEthers = __importStar(require("../index"));
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
var preCompiledContractAddress = '0x000000000000000000000000000000000000007E';
var node1 = 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=';
var node2 = 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs=';
var node3 = 'k2zXEin4Ip/qBGlRkJejnGWdP9cjkK+DAvKNW31L2C8=';
var node3Address = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
describe('Pantheon Ethers', function () {
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
    test('Check overridden functions have been exported', function () {
        expect(PantheonEthers).toBeDefined();
        expect(PantheonEthers.utils).toBeDefined();
        expect(PantheonEthers.utils.serialize).toBeInstanceOf(Function);
        expect(PantheonEthers.utils.encode).toBeInstanceOf(Function);
        expect(PantheonEthers.providers.PrivateJsonRpcProvider).toBeInstanceOf(Function);
        expect(PantheonEthers.providers.PantheonProvider).toBeInstanceOf(Function);
    });
    test('signed transaction matches EEA client', function () { return __awaiter(_this, void 0, void 0, function () {
        var privateKey, wallet, unsignedTransaction, eeaSignedRlpEncoded, signedTransaction, parsedTransaction, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    privateKey = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63';
                    wallet = new index_1.PrivateWallet(privateKey);
                    unsignedTransaction = {
                        nonce: 0,
                        gasPrice: 0,
                        gasLimit: 3000000,
                        // to: undefined,
                        value: 0,
                        data: '0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610221806100606000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633fa4f2451461005c5780636057361d1461008757806367e404ce146100b4575b600080fd5b34801561006857600080fd5b5061007161010b565b6040518082815260200191505060405180910390f35b34801561009357600080fd5b506100b260048036038101908080359060200190929190505050610115565b005b3480156100c057600080fd5b506100c96101cb565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6000600254905090565b7fc9db20adedc6cf2b5d25252b101ab03e124902a73fcb12b753f3d1aaa2d8f9f53382604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a18060028190555033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050905600a165627a7a723058208efaf938851fb2d235f8bf9a9685f149129a30fe0f4b20a6c1885dc02f639eba0029',
                        chainId: 2018,
                        privateFrom: node1,
                        privateFor: [node2],
                        restriction: 'restricted',
                    };
                    eeaSignedRlpEncoded = '0xf9031f8080832dc6c08080b90281608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610221806100606000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633fa4f2451461005c5780636057361d1461008757806367e404ce146100b4575b600080fd5b34801561006857600080fd5b5061007161010b565b6040518082815260200191505060405180910390f35b34801561009357600080fd5b506100b260048036038101908080359060200190929190505050610115565b005b3480156100c057600080fd5b506100c96101cb565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6000600254905090565b7fc9db20adedc6cf2b5d25252b101ab03e124902a73fcb12b753f3d1aaa2d8f9f53382604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a18060028190555033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050905600a165627a7a723058208efaf938851fb2d235f8bf9a9685f149129a30fe0f4b20a6c1885dc02f639eba0029820fe7a0ea2340ef4a0d32e2c44fed9b8d880a38a1ecfbef618ca0234a404c2360719617a063acf2ee8286787f3ebb640da56ded5952c8bdc8d1bf374e2dfe5afdeb79bea8a0035695b4cc4b0941e60551d7a19cf30603db5bfc23e5ac43a56f57f25f75486ae1a02a8d9b56a0fe9cd94d60be4413bcb721d3a7be27ed8e28b3a6346df874ee141b8a72657374726963746564';
                    return [4 /*yield*/, wallet.signPrivateTransaction(unsignedTransaction)];
                case 1:
                    signedTransaction = _c.sent();
                    expect(signedTransaction).toEqual(eeaSignedRlpEncoded);
                    parsedTransaction = providerNode1.formatter.transaction(signedTransaction);
                    expect(parsedTransaction.nonce).toEqual(unsignedTransaction.nonce);
                    expect(parsedTransaction.to).toBeNull();
                    _b = (_a = expect(parsedTransaction.from)).toEqual;
                    return [4 /*yield*/, wallet.getAddress()];
                case 2:
                    _b.apply(_a, [_c.sent()]);
                    expect(parsedTransaction.data).toEqual(unsignedTransaction.data);
                    expect(parsedTransaction.chainId).toEqual(unsignedTransaction.chainId);
                    expect(parsedTransaction.privateFrom).toEqual(unsignedTransaction.privateFrom);
                    expect(parsedTransaction.privateFor).toEqual(unsignedTransaction.privateFor);
                    expect(parsedTransaction.restriction).toEqual(unsignedTransaction.restriction);
                    // compare properties that are parsed as a BigNumber
                    expect(parsedTransaction.gasPrice.eq(unsignedTransaction.gasPrice)).toBeTruthy();
                    expect(parsedTransaction.gasLimit.eq(unsignedTransaction.gasLimit)).toBeTruthy();
                    expect(parsedTransaction.value.eq(unsignedTransaction.value)).toBeTruthy();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('getPrivateTransactionReceipt', function () {
        test('missing hash', function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, providerNode1.getPrivateTransactionReceipt('0x0000000000000000000000000000000000000000000000000000000000000001')];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    test('get precompiled contract', function () { return __awaiter(_this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, providerNode1.getPrivacyPrecompileAddress()];
                case 1:
                    result = _a.sent();
                    expect(result).toEqual(preCompiledContractAddress.toLowerCase());
                    return [2 /*return*/];
            }
        });
    }); });
    describe('Create privacy group and send transactions', function () {
        var testPrivacyGroupId;
        var testPrivacyGroupOptions;
        var prePrivateNonce;
        var publicNonce;
        var node3Nonce;
        var publicTxHash;
        var privateTxHash;
        // have to set here as it's used in the Jest describe.each template which is run before BeforeAll is run
        var txFromAddress = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf';
        var privateKey = '0x0000000000000000000000000000000000000000000000000000000000000001';
        var deployData = '0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610221806100606000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633fa4f2451461005c5780636057361d1461008757806367e404ce146100b4575b600080fd5b34801561006857600080fd5b5061007161010b565b6040518082815260200191505060405180910390f35b34801561009357600080fd5b506100b260048036038101908080359060200190929190505050610115565b005b3480156100c057600080fd5b506100c96101cb565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6000600254905090565b7fc9db20adedc6cf2b5d25252b101ab03e124902a73fcb12b753f3d1aaa2d8f9f53382604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a18060028190555033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050905600a165627a7a723058208efaf938851fb2d235f8bf9a9685f149129a30fe0f4b20a6c1885dc02f639eba0029';
        var eeaWallet = new index_1.PrivateWallet(privateKey);
        test('Create new privacy group', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, providerNode3.createPrivacyGroup([node1, node3], 'Node 1 & 3', 'node3, [node1, node3]')];
                    case 1:
                        testPrivacyGroupId = _a.sent();
                        console.log("Node 3 created privacy group id " + testPrivacyGroupId);
                        expect(testPrivacyGroupId).toMatch(index_1.utils.RegEx.base64);
                        expect(testPrivacyGroupId).toHaveLength(44);
                        testPrivacyGroupOptions = {
                            privateFor: testPrivacyGroupId
                        };
                        return [2 /*return*/];
                }
            });
        }); });
        describe('pre transaction checks', function () {
            describe('get private transaction count from', function () {
                test('node 3', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode3.getPrivateTransactionCount(txFromAddress, testPrivacyGroupOptions)];
                            case 1:
                                prePrivateNonce = _a.sent();
                                expect(prePrivateNonce).toBeGreaterThanOrEqual(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 2', function () { return __awaiter(_this, void 0, void 0, function () {
                    var result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode2.getPrivateTransactionCount(txFromAddress, testPrivacyGroupOptions)];
                            case 1:
                                result = _a.sent();
                                expect(result).toEqual(prePrivateNonce);
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 1', function () { return __awaiter(_this, void 0, void 0, function () {
                    var result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode1.getPrivateTransactionCount(txFromAddress, testPrivacyGroupOptions)];
                            case 1:
                                result = _a.sent();
                                expect(result).toEqual(prePrivateNonce);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('get public transaction count from ', function () {
                test('node 3 from address', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode3.getTransactionCount(txFromAddress)];
                            case 1:
                                publicNonce = _a.sent();
                                expect(publicNonce).toEqual(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 3 signing address', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode3.getTransactionCount(node3Address)];
                            case 1:
                                node3Nonce = _a.sent();
                                expect(publicNonce).toEqual(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        });
        test('node 3 sends signed deploy transaction', function () { return __awaiter(_this, void 0, void 0, function () {
            var unsignedTransaction, signedTransaction, tx, txReceipt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        unsignedTransaction = {
                            nonce: prePrivateNonce,
                            gasPrice: 0,
                            gasLimit: 3000000,
                            // to: undefined,
                            value: 0,
                            data: deployData,
                            chainId: 2018,
                            privateFrom: node3,
                            privateFor: testPrivacyGroupId
                        };
                        return [4 /*yield*/, eeaWallet.signPrivateTransaction(unsignedTransaction)];
                    case 1:
                        signedTransaction = _a.sent();
                        return [4 /*yield*/, providerNode3.sendPrivateTransaction(signedTransaction)];
                    case 2:
                        tx = _a.sent();
                        expect(tx.publicHash).toMatch(index_1.utils.RegEx.transactionHash);
                        expect(tx.privateHash).toMatch(index_1.utils.RegEx.transactionHash);
                        expect(tx.privateHash).not.toEqual(tx.publicHash);
                        publicTxHash = tx.publicHash;
                        privateTxHash = tx.privateHash;
                        return [4 /*yield*/, providerNode3.waitForTransaction(tx.publicHash)];
                    case 3:
                        txReceipt = _a.sent();
                        expect(txReceipt.status).toEqual(1);
                        expect(txReceipt.contractAddress).toBeNull();
                        expect(txReceipt.to).toEqual(preCompiledContractAddress);
                        return [2 /*return*/];
                }
            });
        }); });
        describe('Post transaction count checks', function () {
            describe('get private transaction count from', function () {
                test('node 3 from address', function () { return __awaiter(_this, void 0, void 0, function () {
                    var result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode3.getPrivateTransactionCount(txFromAddress, testPrivacyGroupOptions)];
                            case 1:
                                result = _a.sent();
                                expect(result).toEqual(prePrivateNonce + 1);
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 2', function () { return __awaiter(_this, void 0, void 0, function () {
                    var result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode2.getPrivateTransactionCount(txFromAddress, testPrivacyGroupOptions)];
                            case 1:
                                result = _a.sent();
                                expect(result).toEqual(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 1', function () { return __awaiter(_this, void 0, void 0, function () {
                    var result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode1.getPrivateTransactionCount(txFromAddress, testPrivacyGroupOptions)];
                            case 1:
                                result = _a.sent();
                                expect(result).toEqual(prePrivateNonce + 1);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('get public transaction count from', function () {
                test('node 3', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode3.getTransactionCount(txFromAddress)];
                            case 1:
                                publicNonce = _a.sent();
                                expect(publicNonce).toEqual(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 3 signing address', function () { return __awaiter(_this, void 0, void 0, function () {
                    var result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode3.getTransactionCount(node3Address)];
                            case 1:
                                result = _a.sent();
                                expect(result).toEqual(node3Nonce + 1);
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 2', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode2.getTransactionCount(txFromAddress)];
                            case 1:
                                publicNonce = _a.sent();
                                expect(publicNonce).toEqual(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 1', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode1.getTransactionCount(txFromAddress)];
                            case 1:
                                publicNonce = _a.sent();
                                expect(publicNonce).toEqual(0);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('Get private transaction receipt using public tx hash from', function () {
                test('node 3', function () { return __awaiter(_this, void 0, void 0, function () {
                    var txReceipt;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode3.getPrivateTransactionReceipt(publicTxHash)];
                            case 1:
                                txReceipt = _a.sent();
                                expect(txReceipt.contractAddress).toMatch(index_1.utils.RegEx.ethereumAddress);
                                expect(txReceipt.from).toEqual('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf');
                                expect(txReceipt.to).toBeNull();
                                expect(txReceipt.logs).toEqual([]);
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 2', function () { return __awaiter(_this, void 0, void 0, function () {
                    var txReceipt;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode2.getPrivateTransactionReceipt(publicTxHash)];
                            case 1:
                                txReceipt = _a.sent();
                                expect(txReceipt).toBeNull();
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 1', function () { return __awaiter(_this, void 0, void 0, function () {
                    var txReceipt;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode1.getPrivateTransactionReceipt(publicTxHash)];
                            case 1:
                                txReceipt = _a.sent();
                                expect(txReceipt.contractAddress).toMatch(index_1.utils.RegEx.ethereumAddress);
                                expect(txReceipt.from).toEqual('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf');
                                expect(txReceipt.to).toBeNull();
                                expect(txReceipt.logs).toEqual([]);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('Get private transaction receipt using private tx hash from', function () {
                test('node 3', function () { return __awaiter(_this, void 0, void 0, function () {
                    var txReceipt;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode3.getPrivateTransactionReceipt(privateTxHash)];
                            case 1:
                                txReceipt = _a.sent();
                                expect(txReceipt).toBeNull();
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 2', function () { return __awaiter(_this, void 0, void 0, function () {
                    var txReceipt;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode2.getPrivateTransactionReceipt(privateTxHash)];
                            case 1:
                                txReceipt = _a.sent();
                                expect(txReceipt).toBeNull();
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 1', function () { return __awaiter(_this, void 0, void 0, function () {
                    var txReceipt;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode1.getPrivateTransactionReceipt(privateTxHash)];
                            case 1:
                                txReceipt = _a.sent();
                                expect(txReceipt).toBeNull();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('Get public transaction receipt using public tx hash from', function () {
                test('node 3', function () { return __awaiter(_this, void 0, void 0, function () {
                    var txReceipt;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode3.getTransactionReceipt(publicTxHash)];
                            case 1:
                                txReceipt = _a.sent();
                                expect(txReceipt.status).toEqual(1);
                                expect(txReceipt.contractAddress).toBeNull();
                                expect(txReceipt.from).toEqual(node3Address);
                                expect(txReceipt.to).toEqual(preCompiledContractAddress);
                                expect(txReceipt.logs).toEqual([]);
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 2', function () { return __awaiter(_this, void 0, void 0, function () {
                    var txReceipt;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode2.getTransactionReceipt(publicTxHash)];
                            case 1:
                                txReceipt = _a.sent();
                                expect(txReceipt.status).toEqual(1);
                                expect(txReceipt.contractAddress).toBeNull();
                                expect(txReceipt.from).toEqual(node3Address);
                                expect(txReceipt.to).toEqual(preCompiledContractAddress);
                                expect(txReceipt.logs).toEqual([]);
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 1', function () { return __awaiter(_this, void 0, void 0, function () {
                    var txReceipt;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode1.getTransactionReceipt(publicTxHash)];
                            case 1:
                                txReceipt = _a.sent();
                                expect(txReceipt.status).toEqual(1);
                                expect(txReceipt.contractAddress).toBeNull();
                                expect(txReceipt.from).toEqual(node3Address);
                                expect(txReceipt.to).toEqual(preCompiledContractAddress);
                                expect(txReceipt.logs).toEqual([]);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('Get public transaction using public transaction hash from', function () {
                test('node 3', function () { return __awaiter(_this, void 0, void 0, function () {
                    var tx;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode3.getTransaction(publicTxHash)];
                            case 1:
                                tx = _a.sent();
                                privateTxHash = tx.data;
                                expect(tx.hash).toEqual(publicTxHash);
                                expect(tx.to).toMatch(index_1.utils.RegEx.ethereumAddress);
                                expect(tx.from).toEqual(node3Address);
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 2', function () { return __awaiter(_this, void 0, void 0, function () {
                    var tx;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode2.getTransaction(publicTxHash)];
                            case 1:
                                tx = _a.sent();
                                expect(tx.hash).toEqual(publicTxHash);
                                expect(tx.to).toMatch(index_1.utils.RegEx.ethereumAddress);
                                expect(tx.from).toEqual(node3Address);
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 1', function () { return __awaiter(_this, void 0, void 0, function () {
                    var tx;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode1.getTransaction(publicTxHash)];
                            case 1:
                                tx = _a.sent();
                                expect(tx.hash).toEqual(publicTxHash);
                                expect(tx.to).toMatch(index_1.utils.RegEx.ethereumAddress);
                                expect(tx.from).toEqual(node3Address);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('Get public transaction using private tx hash from', function () {
                test('node 3', function () { return __awaiter(_this, void 0, void 0, function () {
                    var txReceipt;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode3.getTransaction(privateTxHash)];
                            case 1:
                                txReceipt = _a.sent();
                                expect(txReceipt).toBeNull();
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 2', function () { return __awaiter(_this, void 0, void 0, function () {
                    var txReceipt;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode2.getTransaction(privateTxHash)];
                            case 1:
                                txReceipt = _a.sent();
                                expect(txReceipt).toBeNull();
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 1', function () { return __awaiter(_this, void 0, void 0, function () {
                    var txReceipt;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode1.getTransaction(privateTxHash)];
                            case 1:
                                txReceipt = _a.sent();
                                expect(txReceipt).toBeNull();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('Get private transaction using public tx hash from', function () {
                test('node 3', function () { return __awaiter(_this, void 0, void 0, function () {
                    var tx;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode3.getPrivateTransaction(publicTxHash)];
                            case 1:
                                tx = _a.sent();
                                expect(tx.nonce).toEqual(prePrivateNonce);
                                // expect(tx.publicHash).toBeNull()
                                // expect(tx.privateHash).toEqual(privateTxHash)
                                expect(tx.from).toEqual(txFromAddress);
                                expect(tx.to).toBeNull();
                                expect(tx.data).toEqual(deployData);
                                expect(tx.privateFrom).toEqual(node3);
                                expect(tx.privateFor).toEqual(testPrivacyGroupId);
                                expect(tx.restriction).toEqual('restricted');
                                // Test BigNumber values
                                expect(tx.value.eq(0)).toBeTruthy();
                                expect(tx.gasLimit.eq(3000000)).toBeTruthy();
                                expect(tx.gasPrice.eq(0)).toBeTruthy();
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 2', function () { return __awaiter(_this, void 0, void 0, function () {
                    var tx;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode2.getPrivateTransaction(publicTxHash)];
                            case 1:
                                tx = _a.sent();
                                expect(tx).toBeNull();
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 1', function () { return __awaiter(_this, void 0, void 0, function () {
                    var tx;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode1.getPrivateTransaction(publicTxHash)];
                            case 1:
                                tx = _a.sent();
                                expect(tx.nonce).toEqual(prePrivateNonce);
                                // expect(tx.publicHash).toBeNull()
                                // expect(tx.privateHash).toEqual(privateTxHash)
                                expect(tx.from).toEqual(txFromAddress);
                                expect(tx.to).toBeNull();
                                expect(tx.data).toEqual(deployData);
                                expect(tx.privateFrom).toEqual(node3);
                                expect(tx.privateFor).toEqual(testPrivacyGroupId);
                                expect(tx.restriction).toEqual('restricted');
                                // Test BigNumber values
                                expect(tx.value.eq(0)).toBeTruthy();
                                expect(tx.gasLimit.eq(3000000)).toBeTruthy();
                                expect(tx.gasPrice.eq(0)).toBeTruthy();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('Get private transaction using private tx hash from', function () {
                test('node 3', function () { return __awaiter(_this, void 0, void 0, function () {
                    var txReceipt;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode3.getPrivateTransaction(privateTxHash)];
                            case 1:
                                txReceipt = _a.sent();
                                expect(txReceipt).toBeNull();
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 2', function () { return __awaiter(_this, void 0, void 0, function () {
                    var txReceipt;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode2.getPrivateTransaction(privateTxHash)];
                            case 1:
                                txReceipt = _a.sent();
                                expect(txReceipt).toBeNull();
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('node 1', function () { return __awaiter(_this, void 0, void 0, function () {
                    var txReceipt;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, providerNode1.getPrivateTransaction(privateTxHash)];
                            case 1:
                                txReceipt = _a.sent();
                                expect(txReceipt).toBeNull();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        });
    });
    describe('private for only one other party', function () {
        describe.each(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        testDescription | privacyGroup | txOptions | txFromAddress\n        ", " | ", " | ", " | ", "\n        ", " | ", "  | ", " | ", "\n        ", " | ", " | ", " | ", "\n    "], ["\n        testDescription | privacyGroup | txOptions | txFromAddress\n        ", " | ", " | ", " | ", "\n        ", " | ", "  | ", " | ", "\n        ", " | ", " | ", " | ", "\n    "])), 'find count and receipt using privateFrom and privateFor', { privateFrom: node1, privateFor: [node2] }, { privateFrom: node1, privateFor: [node2] }, '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF', 'find count and receipt using privacy group id', { privateFor: 'DyAOiF/ynpc+JXa2YAGB0bCitSlOMNm+ShmB/7M6C4w=' }, { privateFrom: node1, privateFor: [node2] }, '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF', 'privateFor using privacyGroupId', { privateFor: 'DyAOiF/ynpc+JXa2YAGB0bCitSlOMNm+ShmB/7M6C4w=' }, { privateFrom: node1, privateFor: 'DyAOiF/ynpc+JXa2YAGB0bCitSlOMNm+ShmB/7M6C4w=' }, '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF')('$testDescription. Params: privacyGroup $privacyGroup, txOptions $txOptions and from $txFromAddress', function (_a) {
            var testDescription = _a.testDescription, txFromAddress = _a.txFromAddress, privacyGroup = _a.privacyGroup, txOptions = _a.txOptions;
            var eeaWallet;
            var privateNonce;
            var publicNonce;
            var publicTxHash;
            var unsignedTransaction;
            beforeAll(function () {
                // 0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF
                var privateKey = '0x0000000000000000000000000000000000000000000000000000000000000002';
                eeaWallet = new index_1.PrivateWallet(privateKey);
            });
            test('Check privacy group', function () {
                if (typeof privacyGroup === 'string') {
                    expect(index_1.generatePrivacyGroup(txOptions)).toEqual(privacyGroup);
                }
            });
            test('get private transaction count from node1', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode1.getPrivateTransactionCount(txFromAddress, privacyGroup)];
                        case 1:
                            privateNonce = _a.sent();
                            expect(privateNonce).toBeGreaterThanOrEqual(0);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('get public transaction count from node1', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode1.getTransactionCount(txFromAddress)];
                        case 1:
                            publicNonce = _a.sent();
                            expect(publicNonce).toEqual(0);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('send signed deploy transaction', function () { return __awaiter(_this, void 0, void 0, function () {
                var signedTransaction, tx, txReceipt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // deploy a contract
                            unsignedTransaction = __assign({ nonce: privateNonce, gasPrice: 0, gasLimit: 3000000, 
                                // to: undefined,
                                value: 0, data: '0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610221806100606000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633fa4f2451461005c5780636057361d1461008757806367e404ce146100b4575b600080fd5b34801561006857600080fd5b5061007161010b565b6040518082815260200191505060405180910390f35b34801561009357600080fd5b506100b260048036038101908080359060200190929190505050610115565b005b3480156100c057600080fd5b506100c96101cb565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6000600254905090565b7fc9db20adedc6cf2b5d25252b101ab03e124902a73fcb12b753f3d1aaa2d8f9f53382604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a18060028190555033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050905600a165627a7a723058208efaf938851fb2d235f8bf9a9685f149129a30fe0f4b20a6c1885dc02f639eba0029', chainId: 2018 }, txOptions);
                            return [4 /*yield*/, eeaWallet.signPrivateTransaction(unsignedTransaction)];
                        case 1:
                            signedTransaction = _a.sent();
                            return [4 /*yield*/, providerNode1.sendPrivateTransaction(signedTransaction)];
                        case 2:
                            tx = _a.sent();
                            expect(tx.privateHash).toMatch(index_1.utils.RegEx.transactionHash);
                            publicTxHash = tx.publicHash;
                            expect(tx.nonce).toEqual(unsignedTransaction.nonce);
                            expect(tx.data).toEqual(unsignedTransaction.data);
                            expect(tx.privateFor).toEqual(unsignedTransaction.privateFor);
                            expect(tx.privateFrom).toEqual(unsignedTransaction.privateFrom);
                            expect(tx.chainId).toEqual(unsignedTransaction.chainId);
                            return [4 /*yield*/, providerNode1.waitForTransaction(tx.publicHash)];
                        case 3:
                            txReceipt = _a.sent();
                            expect(txReceipt.status).toEqual(1);
                            expect(txReceipt.contractAddress).toBeNull();
                            return [2 /*return*/];
                    }
                });
            }); }, 30000);
            test('get private transaction counts from each node', function () { return __awaiter(_this, void 0, void 0, function () {
                var nonceNode1, nonceNode2, nonceNode3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode1.getPrivateTransactionCount(txFromAddress, privacyGroup)];
                        case 1:
                            nonceNode1 = _a.sent();
                            expect(nonceNode1).toBeGreaterThanOrEqual(privateNonce + 1);
                            return [4 /*yield*/, providerNode2.getPrivateTransactionCount(txFromAddress, privacyGroup)];
                        case 2:
                            nonceNode2 = _a.sent();
                            expect(nonceNode2).toBeGreaterThanOrEqual(privateNonce + 1);
                            return [4 /*yield*/, providerNode3.getPrivateTransactionCount(txFromAddress, privacyGroup)];
                        case 3:
                            nonceNode3 = _a.sent();
                            expect(nonceNode3).toBeGreaterThanOrEqual(publicNonce);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('get public transaction count from each node', function () { return __awaiter(_this, void 0, void 0, function () {
                var nonceNode1, nonceNode2, nonceNode3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode1.getTransactionCount(txFromAddress)];
                        case 1:
                            nonceNode1 = _a.sent();
                            expect(nonceNode1).toBeGreaterThanOrEqual(publicNonce);
                            return [4 /*yield*/, providerNode2.getTransactionCount(txFromAddress)];
                        case 2:
                            nonceNode2 = _a.sent();
                            expect(nonceNode2).toBeGreaterThanOrEqual(publicNonce);
                            return [4 /*yield*/, providerNode3.getTransactionCount(txFromAddress)];
                        case 3:
                            nonceNode3 = _a.sent();
                            expect(nonceNode3).toBeGreaterThanOrEqual(publicNonce);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('get public transaction receipts from each node', function () { return __awaiter(_this, void 0, void 0, function () {
                var txReceiptNode1, txReceiptNode2, txReceiptNode3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode1.getTransactionReceipt(publicTxHash)];
                        case 1:
                            txReceiptNode1 = _a.sent();
                            expect(txReceiptNode1.status).toEqual(1);
                            expect(txReceiptNode1.transactionHash).toEqual(publicTxHash);
                            expect(txReceiptNode1.contractAddress).toBeNull();
                            return [4 /*yield*/, providerNode2.getTransactionReceipt(publicTxHash)];
                        case 2:
                            txReceiptNode2 = _a.sent();
                            expect(txReceiptNode2.status).toEqual(1);
                            expect(txReceiptNode2.transactionHash).toEqual(publicTxHash);
                            expect(txReceiptNode2.contractAddress).toBeNull();
                            return [4 /*yield*/, providerNode3.getTransactionReceipt(publicTxHash)];
                        case 3:
                            txReceiptNode3 = _a.sent();
                            expect(txReceiptNode3.status).toEqual(1);
                            expect(txReceiptNode3.transactionHash).toEqual(publicTxHash);
                            expect(txReceiptNode3.contractAddress).toBeNull();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('get private transaction receipts from each node', function () { return __awaiter(_this, void 0, void 0, function () {
                var txReceiptNode1, txReceiptNode2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode1.getPrivateTransactionReceipt(publicTxHash)];
                        case 1:
                            txReceiptNode1 = _a.sent();
                            expect(txReceiptNode1.contractAddress).toMatch(index_1.utils.RegEx.ethereumAddress);
                            expect(txReceiptNode1.from).toMatch(index_1.utils.RegEx.ethereumAddress);
                            expect(txReceiptNode1.to).toBeNull();
                            return [4 /*yield*/, providerNode2.getPrivateTransactionReceipt(publicTxHash)];
                        case 2:
                            txReceiptNode2 = _a.sent();
                            expect(txReceiptNode2.contractAddress).toMatch(index_1.utils.RegEx.ethereumAddress);
                            expect(txReceiptNode2.from).toMatch(index_1.utils.RegEx.ethereumAddress);
                            expect(txReceiptNode2.to).toBeNull();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('try and get private transaction receipt from node not in transaction', function () { return __awaiter(_this, void 0, void 0, function () {
                var txReceiptNode3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode3.getPrivateTransactionReceipt(publicTxHash)];
                        case 1:
                            txReceiptNode3 = _a.sent();
                            expect(txReceiptNode3).toBeNull();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('get public transaction by hash', function () { return __awaiter(_this, void 0, void 0, function () {
                var txNode1, txNode2, txNode3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode1.getTransaction(publicTxHash)];
                        case 1:
                            txNode1 = _a.sent();
                            return [4 /*yield*/, providerNode2.getTransaction(publicTxHash)];
                        case 2:
                            txNode2 = _a.sent();
                            return [4 /*yield*/, providerNode3.getTransaction(publicTxHash)];
                        case 3:
                            txNode3 = _a.sent();
                            expect(txNode1.data).toMatch(index_1.utils.RegEx.bytes32);
                            // TODO validate against node 1 public key
                            expect(txNode1.from).toMatch(index_1.utils.RegEx.ethereumAddress);
                            expect(txNode2.from).toMatch(index_1.utils.RegEx.ethereumAddress);
                            expect(txNode2.data).toMatch(txNode1.data);
                            expect(txNode3.from).toMatch(index_1.utils.RegEx.ethereumAddress);
                            expect(txNode3.data).toMatch(txNode1.data);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('get private transaction by hash', function () { return __awaiter(_this, void 0, void 0, function () {
                var txNode1, txNode2, txNode3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, providerNode1.getPrivateTransaction(publicTxHash)];
                        case 1:
                            txNode1 = _a.sent();
                            expect(txNode1.privateFrom).toEqual(txOptions.privateFrom);
                            expect(txNode1.privateFor).toEqual(txOptions.privateFor);
                            return [4 /*yield*/, providerNode2.getPrivateTransaction(publicTxHash)];
                        case 2:
                            txNode2 = _a.sent();
                            expect(txNode2.privateFrom).toEqual(txOptions.privateFrom);
                            expect(txNode2.privateFor).toEqual(txOptions.privateFor);
                            return [4 /*yield*/, providerNode3.getPrivateTransaction(publicTxHash)];
                        case 3:
                            txNode3 = _a.sent();
                            expect(txNode3).toEqual(null);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
});
var templateObject_1;
