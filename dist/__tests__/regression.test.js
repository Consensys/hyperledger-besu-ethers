"use strict";
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
var fs_1 = require("fs");
var index_1 = require("../index");
// import { Contract, ContractFactory, Wallet, providers } from 'ethers'   // version 5
// import { Contract, ContractFactory, Wallet, providers } from 'ethers-4'
var RegEx_1 = require("../utils/RegEx");
var url = "http://localhost:20000";
// const url = "http://localhost:8646";
var provider = new index_1.providers.JsonRpcProvider(url);
provider.on('debug', function (info) {
    console.log("Sent \"" + info.action + "\" action with request: " + JSON.stringify(info.request) + "\nResponse: " + JSON.stringify(info.response));
});
var testContractAbi = fs_1.readFileSync('./src/abis/TestContract.abi', 'utf8');
var bytecode = fs_1.readFileSync('./src/abis/TestContract.bin', 'utf8');
describe('Ethers Regression', function () {
    var noEtherWallet = new index_1.Wallet('0x1000000000000000000000000000000000000000000000000000000000000000');
    // one of the three pre-funded dev accounts
    // https://github.com/PegaSysEng/pantheon/blob/master/config/src/main/resources/dev.json
    var etherWallet = new index_1.Wallet('0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63');
    describe('account', function () {
        test('ether balances', function () { return __awaiter(_this, void 0, void 0, function () {
            var nonFundedBalance, fundedBalance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, provider.getBalance(noEtherWallet.address)];
                    case 1:
                        nonFundedBalance = _a.sent();
                        expect(nonFundedBalance.toNumber()).toEqual(0);
                        return [4 /*yield*/, provider.getBalance(etherWallet.address)];
                    case 2:
                        fundedBalance = _a.sent();
                        expect(fundedBalance.gt(0)).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Ether', function () {
        // send ether
        // get transaction receipt
        // get an ether transfer event
    });
    describe('Simple contract', function () {
        // 0x2b5ad5c4795c026514f8317c7a215e218dccd6cf
        var contractWallet = new index_1.Wallet('0x0000000000000000000000000000000000000000000000000000000000000002', provider);
        var contract;
        var txHash;
        test('deploy test contract', function () { return __awaiter(_this, void 0, void 0, function () {
            var factory, txReceipt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        factory = new index_1.ContractFactory(testContractAbi, bytecode, contractWallet);
                        return [4 /*yield*/, factory.deploy()];
                    case 1:
                        contract = _a.sent();
                        expect(contract.address).toMatch(RegEx_1.ethereumAddress);
                        expect(contract.deployTransaction.hash).toMatch(RegEx_1.transactionHash);
                        txHash = contract.deployTransaction.hash;
                        return [4 /*yield*/, contract.deployTransaction.wait()];
                    case 2:
                        txReceipt = _a.sent();
                        expect(txReceipt.status).toEqual(1);
                        return [2 /*return*/];
                }
            });
        }); }, 30000);
        test('get transaction receipt', function () { return __awaiter(_this, void 0, void 0, function () {
            var txReceipt, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, provider.getTransactionReceipt(txHash)];
                    case 1:
                        txReceipt = _c.sent();
                        expect(txReceipt.transactionHash).toEqual(txHash);
                        _b = (_a = expect(txReceipt.from)).toEqual;
                        return [4 /*yield*/, contractWallet.getAddress()];
                    case 2:
                        _b.apply(_a, [_c.sent()]);
                        expect(txReceipt.contractAddress).toEqual(contract.address);
                        return [2 /*return*/];
                }
            });
        }); });
        test('get transaction', function () { return __awaiter(_this, void 0, void 0, function () {
            var tx, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, provider.getTransaction(txHash)];
                    case 1:
                        tx = _c.sent();
                        expect(tx.hash).toEqual(txHash);
                        _b = (_a = expect(tx.from)).toEqual;
                        return [4 /*yield*/, contractWallet.getAddress()];
                    case 2:
                        _b.apply(_a, [_c.sent()]);
                        expect(tx.data).toEqual(contract.deployTransaction.data);
                        return [2 /*return*/];
                }
            });
        }); });
        describe('call contract', function () {
            test('pure function', function () { return __awaiter(_this, void 0, void 0, function () {
                var value;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, contract.getMagicNumber()];
                        case 1:
                            value = _a.sent();
                            expect(value.eq(99999)).toBeTruthy();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('view function', function () { return __awaiter(_this, void 0, void 0, function () {
                var value;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, contract.getTestUint()];
                        case 1:
                            value = _a.sent();
                            expect(value.eq(1)).toBeTruthy();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('public property', function () { return __awaiter(_this, void 0, void 0, function () {
                var value;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, contract.testString()];
                        case 1:
                            value = _a.sent();
                            expect(value).toEqual('test string');
                            return [2 /*return*/];
                    }
                });
            }); });
            test('pure function that fails', function () { return __awaiter(_this, void 0, void 0, function () {
                var result, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            expect.assertions(1);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, contract.pureFail()];
                        case 2:
                            result = _a.sent();
                            console.log(result);
                            expect(false).toBeTruthy();
                            return [3 /*break*/, 4];
                        case 3:
                            err_1 = _a.sent();
                            expect(err_1).toBeInstanceOf(Error);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            test('view function that fails', function () { return __awaiter(_this, void 0, void 0, function () {
                var result, err_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            expect.assertions(1);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, contract.viewFail()];
                        case 2:
                            result = _a.sent();
                            console.log(result);
                            expect(false).toBeTruthy();
                            return [3 /*break*/, 4];
                        case 3:
                            err_2 = _a.sent();
                            expect(err_2).toBeInstanceOf(Error);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('send transaction', function () {
            test('to write data', function () { return __awaiter(_this, void 0, void 0, function () {
                var tx, _a, _b, value;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, contract.setTestUint(2)];
                        case 1:
                            tx = _c.sent();
                            expect(tx.hash).toMatch(RegEx_1.transactionHash);
                            expect(tx.to).toEqual(contract.address);
                            _b = (_a = expect(tx.from)).toEqual;
                            return [4 /*yield*/, contractWallet.getAddress()];
                        case 2:
                            _b.apply(_a, [_c.sent()]);
                            return [4 /*yield*/, tx.wait()];
                        case 3:
                            _c.sent();
                            return [4 /*yield*/, contract.getTestUint()];
                        case 4:
                            value = _c.sent();
                            expect(value.eq(2)).toBeTruthy();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('to write data with gasLimit', function () { return __awaiter(_this, void 0, void 0, function () {
                var tx, _a, _b, value;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, contract.setTestUint(3, {
                                gasLimit: 100000
                            })];
                        case 1:
                            tx = _c.sent();
                            expect(tx.hash).toMatch(RegEx_1.transactionHash);
                            expect(tx.to).toEqual(contract.address);
                            _b = (_a = expect(tx.from)).toEqual;
                            return [4 /*yield*/, contractWallet.getAddress()];
                        case 2:
                            _b.apply(_a, [_c.sent()]);
                            return [4 /*yield*/, provider.waitForTransaction(tx.hash)];
                        case 3:
                            _c.sent();
                            return [4 /*yield*/, contract.getTestUint()];
                        case 4:
                            value = _c.sent();
                            expect(value.eq(3)).toBeTruthy();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('that will fail from tx function', function () { return __awaiter(_this, void 0, void 0, function () {
                var tx, receipt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, contract.txFail()];
                        case 1:
                            tx = _a.sent();
                            expect(tx.hash).toMatch(RegEx_1.transactionHash);
                            return [4 /*yield*/, provider.waitForTransaction(tx.hash)];
                        case 2:
                            receipt = _a.sent();
                            expect(receipt.status).toEqual(0);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        // get an event
        describe('Connect to an existing contract from node 2', function () {
            var providerNode2;
            var existingContract;
            test('instantiate', function () {
                providerNode2 = new index_1.providers.JsonRpcProvider("http://localhost:20000");
                var walletNode2 = new index_1.Wallet('0x0000000000000000000000000000000000000000000000000000000000000002', providerNode2);
                existingContract = new index_1.Contract(contract.address, testContractAbi, walletNode2);
            });
            test('write data to contract', function () { return __awaiter(_this, void 0, void 0, function () {
                var tx, _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, existingContract.setTestUint(4)];
                        case 1:
                            tx = _c.sent();
                            expect(tx.hash).toMatch(RegEx_1.transactionHash);
                            expect(tx.to).toEqual(contract.address);
                            _b = (_a = expect(tx.from)).toEqual;
                            return [4 /*yield*/, contractWallet.getAddress()];
                        case 2:
                            _b.apply(_a, [_c.sent()]);
                            return [4 /*yield*/, tx.wait()];
                        case 3:
                            _c.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('read data back from contract', function () { return __awaiter(_this, void 0, void 0, function () {
                var value;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, existingContract.getTestUint()];
                        case 1:
                            value = _a.sent();
                            expect(value.eq(4)).toBeTruthy();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    describe('getTransactionReceipt', function () {
        describe('Failed getTransactionReceipt', function () {
            test('missing hash', function () { return __awaiter(_this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, provider.getTransactionReceipt('0x0000000000000000000000000000000000000000000000000000000000000001')];
                        case 1:
                            result = _a.sent();
                            expect(result).toBeNull();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
});
