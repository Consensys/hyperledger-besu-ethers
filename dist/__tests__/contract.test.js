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
jest.setTimeout(20000);
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
var node1Address = '0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73';
var node2 = 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs=';
// const node3 = 'k2zXEin4Ip/qBGlRkJejnGWdP9cjkK+DAvKNW31L2C8='
var preCompiledContract = '0x000000000000000000000000000000000000007E';
describe('Deploy contract using contract factory', function () {
    var walletNode1;
    var walletNode2;
    var txHash;
    var signerAddress;
    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
        var privateKey;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    privateKey = '0x0000000000000000000000000000000000000000000000000000000000000002';
                    walletNode1 = new index_1.PrivateWallet(privateKey, providerNode1);
                    walletNode2 = new index_1.PrivateWallet(privateKey, providerNode2);
                    return [4 /*yield*/, walletNode1.getAddress()];
                case 1:
                    signerAddress = _a.sent();
                    console.log("Private transaction signer address " + signerAddress);
                    return [2 /*return*/];
            }
        });
    }); });
    describe('Create privacy group before creating the contract', function () {
        var privacyGroupId;
        var privacyGroupOptions;
        var privateTxCountNode1;
        var contractNode1;
        var contractNode2;
        var testContractAbi;
        var bytecode;
        beforeAll(function () {
            testContractAbi = fs_1.readFileSync('./src/abis/TestContract.abi', 'utf8');
            bytecode = fs_1.readFileSync('./src/abis/TestContract.bin', 'utf8');
        });
        test('Create privacy group', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, providerNode1.createPrivacyGroup([node1, node2], 'Top Secret', 'Super secret group')];
                    case 1:
                        privacyGroupId = _a.sent();
                        expect(privacyGroupId).toMatch(index_1.utils.RegEx.base64);
                        expect(privacyGroupId).toHaveLength(44);
                        privacyGroupOptions = {
                            privateFor: privacyGroupId,
                            restriction: 'restricted',
                        };
                        return [2 /*return*/];
                }
            });
        }); });
        test('Check privacy group was created', function () { return __awaiter(_this, void 0, void 0, function () {
            var privacyGroups;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, providerNode1.findPrivacyGroup([node1, node2])];
                    case 1:
                        privacyGroups = _a.sent();
                        expect(privacyGroups).toHaveLength(1);
                        return [2 /*return*/];
                }
            });
        }); });
        test('Get private transaction count before deploy', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, providerNode1.getPrivateTransactionCount(node1Address, privacyGroupOptions)];
                    case 1:
                        privateTxCountNode1 = _a.sent();
                        expect(privateTxCountNode1).toBeGreaterThanOrEqual(0);
                        return [2 /*return*/];
                }
            });
        }); });
        test('deploy test contract', function () { return __awaiter(_this, void 0, void 0, function () {
            var factory, txReceipt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        factory = new index_1.PrivateContractFactory(testContractAbi, bytecode, walletNode1);
                        return [4 /*yield*/, factory.privateDeploy(privacyGroupOptions)];
                    case 1:
                        contractNode1 = _a.sent();
                        expect(contractNode1.address).toMatch(index_1.utils.RegEx.ethereumAddress);
                        expect(contractNode1.deployPrivateTransaction.publicHash).toMatch(index_1.utils.RegEx.transactionHash);
                        txHash = contractNode1.deployPrivateTransaction.publicHash;
                        return [4 /*yield*/, contractNode1.deployPrivateTransaction.wait()];
                    case 2:
                        txReceipt = _a.sent();
                        expect(txReceipt.contractAddress).toEqual(contractNode1.address);
                        expect(txReceipt.to).toBeNull();
                        expect(txReceipt.from).toEqual(signerAddress);
                        expect(txReceipt.logs).toEqual([]);
                        return [2 /*return*/];
                }
            });
        }); });
        test('get private transaction receipt', function () { return __awaiter(_this, void 0, void 0, function () {
            var txReceipt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, providerNode1.getPrivateTransactionReceipt(txHash)];
                    case 1:
                        txReceipt = _a.sent();
                        expect(txReceipt.to).toBeNull();
                        expect(txReceipt.from).toEqual(signerAddress);
                        expect(txReceipt.logs).toEqual([]);
                        expect(txReceipt.contractAddress).toEqual(contractNode1.address);
                        return [2 /*return*/];
                }
            });
        }); });
        test('get public marker transaction receipt', function () { return __awaiter(_this, void 0, void 0, function () {
            var txReceipt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, providerNode1.getTransactionReceipt(txHash)];
                    case 1:
                        txReceipt = _a.sent();
                        expect(txReceipt.status).toEqual(1);
                        expect(txReceipt.from).toEqual(node1Address);
                        expect(txReceipt.to).toEqual(preCompiledContract);
                        expect(txReceipt.logs).toEqual([]);
                        expect(txReceipt.contractAddress).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
        test('Get private transaction count after deploy', function () { return __awaiter(_this, void 0, void 0, function () {
            var count;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, providerNode1.getPrivateTransactionCount(signerAddress, privacyGroupOptions)];
                    case 1:
                        count = _a.sent();
                        expect(count).toEqual(privateTxCountNode1 + 1);
                        return [2 /*return*/];
                }
            });
        }); });
        describe('call contract', function () {
            test('pure function', function () { return __awaiter(_this, void 0, void 0, function () {
                var value;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, contractNode1.getMagicNumber()];
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
                        case 0: return [4 /*yield*/, contractNode1.getTestUint()];
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
                        case 0: return [4 /*yield*/, contractNode1.testString()];
                        case 1:
                            value = _a.sent();
                            expect(value).toEqual('test string');
                            return [2 /*return*/];
                    }
                });
            }); });
            // test('pure function that fails', async() => {
            //     expect.assertions(1)
            //
            //     try {
            //         const result = await contract.pureFail()
            //         console.log(result)
            //         expect(false).toBeTruthy()
            //     }
            //     catch (err) {
            //         expect(err).toBeInstanceOf(Error)
            //     }
            // })
            //
            // test('view function that fails', async() => {
            //     expect.assertions(1)
            //
            //     try {
            //         const result = await contract.viewFail()
            //         console.log(result)
            //         expect(false).toBeTruthy()
            //     }
            //     catch (err) {
            //         expect(err).toBeInstanceOf(Error)
            //     }
            // })
        });
        describe('send transaction', function () {
            test('to write data', function () { return __awaiter(_this, void 0, void 0, function () {
                var tx, receipt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, contractNode1.setTestUint(2)];
                        case 1:
                            tx = _a.sent();
                            expect(tx.publicHash).toMatch(index_1.utils.RegEx.bytes32);
                            expect(tx.to).toEqual(contractNode1.address);
                            expect(tx.from).toEqual(signerAddress);
                            return [4 /*yield*/, providerNode1.waitForTransaction(tx.publicHash)];
                        case 2:
                            receipt = _a.sent();
                            expect(receipt.status).toEqual(1);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('to write data with gasLimit', function () { return __awaiter(_this, void 0, void 0, function () {
                var tx, receipt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, contractNode1.setTestUint(3, {
                                gasLimit: 100000
                            })];
                        case 1:
                            tx = _a.sent();
                            expect(tx.publicHash).toMatch(index_1.utils.RegEx.bytes32);
                            expect(tx.to).toEqual(contractNode1.address);
                            expect(tx.from).toEqual(signerAddress);
                            return [4 /*yield*/, providerNode1.waitForTransaction(tx.publicHash)];
                        case 2:
                            receipt = _a.sent();
                            expect(receipt.status).toEqual(1);
                            return [2 /*return*/];
                    }
                });
            }); });
            test('that will fail from tx function', function () { return __awaiter(_this, void 0, void 0, function () {
                var tx, receipt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, contractNode1.txFail()];
                        case 1:
                            tx = _a.sent();
                            expect(tx.publicHash).toMatch(index_1.utils.RegEx.bytes32);
                            expect(tx.to).toEqual(contractNode1.address);
                            expect(tx.from).toEqual(signerAddress);
                            return [4 /*yield*/, providerNode1.waitForTransaction(tx.publicHash)];
                        case 2:
                            receipt = _a.sent();
                            expect(receipt.status).toEqual(0);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('node 2 interacts to existing contract deployed from node 1 using', function () {
            describe('contract connect function', function () {
                test('instantiate contract', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        contractNode2 = new index_1.PrivateContract(contractNode1.address, privacyGroupOptions, testContractAbi, providerNode2);
                        contractNode2 = contractNode1.connect(walletNode2);
                        expect(contractNode2.address).toEqual(contractNode1.address);
                        return [2 /*return*/];
                    });
                }); });
                test('read data', function () { return __awaiter(_this, void 0, void 0, function () {
                    var value;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, contractNode2.getTestUint()];
                            case 1:
                                value = _a.sent();
                                expect(value.eq(3)).toBeTruthy();
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('write data', function () { return __awaiter(_this, void 0, void 0, function () {
                    var tx, receipt;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, contractNode2.setTestUint(4)];
                            case 1:
                                tx = _a.sent();
                                expect(tx.publicHash).toMatch(index_1.utils.RegEx.bytes32);
                                expect(tx.to).toEqual(contractNode1.address);
                                expect(tx.from).toEqual(signerAddress);
                                return [4 /*yield*/, providerNode2.waitForTransaction(tx.publicHash)];
                            case 2:
                                receipt = _a.sent();
                                expect(receipt.status).toEqual(1);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('contract constructor', function () {
                test('instantiate contract', function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        contractNode2 = new index_1.PrivateContract(contractNode1.address, privacyGroupOptions, testContractAbi, walletNode2);
                        expect(contractNode2.address).toEqual(contractNode1.address);
                        return [2 /*return*/];
                    });
                }); });
                test('read data', function () { return __awaiter(_this, void 0, void 0, function () {
                    var value;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, contractNode2.getTestUint()];
                            case 1:
                                value = _a.sent();
                                expect(value.eq(4)).toBeTruthy();
                                return [2 /*return*/];
                        }
                    });
                }); });
                test('write data', function () { return __awaiter(_this, void 0, void 0, function () {
                    var tx, receipt;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, contractNode2.setTestUint(4)];
                            case 1:
                                tx = _a.sent();
                                expect(tx.publicHash).toMatch(index_1.utils.RegEx.bytes32);
                                expect(tx.to).toEqual(contractNode1.address);
                                expect(tx.from).toEqual(signerAddress);
                                return [4 /*yield*/, providerNode2.waitForTransaction(tx.publicHash)];
                            case 2:
                                receipt = _a.sent();
                                expect(receipt.status).toEqual(1);
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        });
        test('Delete privacy group', function () { return __awaiter(_this, void 0, void 0, function () {
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
    // describe('Using privateFrom and privateFor', () => {
    //
    //     const privacyGroupOptions = {
    //         privateFrom: node1,
    //         privateFor: [node1, node2, node3]
    //     }
    //
    //     test('Get transaction count before deploy', async() => {
    //         const privateTxCount = await providerNode1.getPrivateTransactionCount(node1Address, privacyGroupOptions)
    //         expect(privateTxCount).toBeGreaterThanOrEqual(0)
    //     })
    //
    //     test('deploy test contract', async() => {
    //
    //         const testContractAbi = readFileSync('./src/abis/TestContract.abi', 'utf8')
    //         const bytecode = readFileSync('./src/abis/TestContract.bin', 'utf8')
    //
    //         const factory = new PrivateContractFactory(testContractAbi, bytecode, node1Wallet);
    //
    //         let contract = await factory.privateDeploy(privacyGroupOptions);
    //
    //         expect(contract.address).toMatch(utils.RegEx.ethereumAddress)
    //         expect(contract.deployTransaction.hash).toMatch(utils.RegEx.transactionHash)
    //
    //         const txReceipt = await contract.deployTransaction.wait()
    //
    //         expect(txReceipt.status).toEqual(1)
    //         expect(txReceipt.contractAddress).toMatch(utils.RegEx.ethereumAddress)
    //         contractAddress = txReceipt.contractAddress
    //
    //         privateTxHash = txReceipt.transactionHash
    //
    //     }, 30000)
    //
    //     test('get transaction receipt', async() => {
    //         const txReceipt = await providerNode1.getPrivateTransactionReceipt(privateTxHash)
    //         expect(txReceipt.transactionHash).toEqual(privateTxHash)
    //         expect(txReceipt.contractAddress).toEqual(contractAddress)
    //     })
    //
    //
    //     test('Check privacy group was created', async() => {
    //         const privacyGroups = await providerNode1.findPrivacyGroup(
    //             [node1, node2, node3]
    //         )
    //         expect(privacyGroups).toHaveLength(1)
    //     })
    // })
});
