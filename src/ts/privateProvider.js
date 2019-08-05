"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_1 = require("@ethersproject/bignumber");
var bytes_1 = require("@ethersproject/bytes");
var errors = __importStar(require("@ethersproject/errors"));
var properties_1 = require("@ethersproject/properties");
var providers_1 = require("@ethersproject/providers");
var web_1 = require("@ethersproject/web");
var bytes_2 = require("./bytes");
var privateFormatter_1 = require("./privateFormatter");
var privacyGroup_1 = require("./privacyGroup");
var privateTransaction_1 = require("./privateTransaction");
var _constructorGuard = {};
var PrivateJsonRpcSigner = /** @class */ (function (_super) {
    __extends(PrivateJsonRpcSigner, _super);
    function PrivateJsonRpcSigner(constructorGuard, provider, addressOrIndex) {
        var _this = this;
        if (constructorGuard !== _constructorGuard) {
            throw new Error("do not call the PrivateJsonRpcSigner constructor directly; use provider.getSigner");
        }
        _this = _super.call(this, constructorGuard, provider, addressOrIndex) || this;
        return _this;
    }
    PrivateJsonRpcSigner.prototype.sendPrivateUncheckedTransaction = function (transaction) {
        var _this = this;
        transaction = properties_1.shallowCopy(transaction);
        var fromAddress = this.getAddress().then(function (address) {
            if (address) {
                address = address.toLowerCase();
            }
            return address;
        });
        // The JSON-RPC for eth_sendTransaction uses 90000 gas; if the user
        // wishes to use this, it is easy to specify explicitly, otherwise
        // we look it up for them.
        if (transaction.gasLimit == null) {
            var estimate = properties_1.shallowCopy(transaction);
            estimate.from = fromAddress;
            transaction.gasLimit = this.provider.estimateGas(estimate);
        }
        return Promise.all([
            properties_1.resolveProperties(transaction),
            fromAddress
        ]).then(function (results) {
            var tx = results[0];
            var hexTx = _this.provider.constructor.hexlifyTransaction(tx);
            hexTx.from = results[1];
            // method overridden to use EEA send transaction
            return _this.provider.send("eea_sendTransaction", [hexTx]).then(function (hash) {
                return hash;
            }, function (error) {
                if (error.responseText) {
                    // See: JsonRpcProvider.sendTransaction (@TODO: Expose a ._throwError??)
                    if (error.responseText.indexOf("insufficient funds") >= 0) {
                        errors.throwError("insufficient funds", errors.INSUFFICIENT_FUNDS, {
                            transaction: tx
                        });
                    }
                    if (error.responseText.indexOf("nonce too low") >= 0) {
                        errors.throwError("nonce has already been used", errors.NONCE_EXPIRED, {
                            transaction: tx
                        });
                    }
                    if (error.responseText.indexOf("replacement transaction underpriced") >= 0) {
                        errors.throwError("replacement fee too low", errors.REPLACEMENT_UNDERPRICED, {
                            transaction: tx
                        });
                    }
                }
                throw error;
            });
        });
    };
    PrivateJsonRpcSigner.prototype.sendPrivateTransaction = function (transaction) {
        var _this = this;
        return this.sendPrivateUncheckedTransaction(transaction).then(function (publicTransactionHash) {
            return web_1.poll(function () {
                return _this.provider.getPrivateTransaction(publicTransactionHash).then(function (tx) {
                    if (tx === null) {
                        return undefined;
                    }
                    return _this.provider._wrapPrivateTransaction(tx, publicTransactionHash);
                });
            }, { onceBlock: _this.provider }).catch(function (error) {
                error.transactionHash = publicTransactionHash;
                throw error;
            });
        });
    };
    return PrivateJsonRpcSigner;
}(providers_1.JsonRpcSigner));
exports.PrivateJsonRpcSigner = PrivateJsonRpcSigner;
function getResult(payload) {
    if (payload.error) {
        // @TODO: not any
        var error = new Error(payload.error.message);
        error.code = payload.error.code;
        error.data = payload.error.data;
        throw error;
    }
    return payload.result;
}
function getLowerCase(value) {
    if (value) {
        return value.toLowerCase();
    }
    return value;
}
var defaultFormatter = null;
var PrivateJsonRpcProvider = /** @class */ (function (_super) {
    __extends(PrivateJsonRpcProvider, _super);
    function PrivateJsonRpcProvider(url, network) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, url, network) || this;
        _this.formatter = _newTarget.getFormatter();
        return _this;
    }
    PrivateJsonRpcProvider.getFormatter = function () {
        if (defaultFormatter == null) {
            defaultFormatter = new privateFormatter_1.PrivateFormatter();
        }
        return defaultFormatter;
    };
    PrivateJsonRpcProvider.prototype.send = function (method, params) {
        var _this = this;
        var id = this._nextId++;
        var request = {
            method: method,
            params: params,
            id: id,
            jsonrpc: "2.0"
        };
        return web_1.fetchJson(this.connection, JSON.stringify(request), getResult)
            .then(function (result) {
            _this.emit("debug", {
                action: "send",
                request: request,
                response: result,
                provider: _this
            });
            if (result && result.message) {
                throw errors.makeError(result.message, result.code, {});
            }
            return result;
        })
            .catch(function (err) {
            throw errors.makeError("Failed JSON-RPC call.", err.code, {
                method: method, params: params, cause: err,
            });
        });
    };
    PrivateJsonRpcProvider.prototype.sendPrivateTransaction = function (signedTransaction) {
        var _this = this;
        return this._runPerform("sendPrivateTransaction", {
            signedTransaction: function () { return Promise.resolve(signedTransaction).then(function (t) { return bytes_2.hexlify(t); }); }
        }).then(function (publicTransactionHash) {
            var parsedTransaction = _this.formatter.transaction(signedTransaction);
            return _this._wrapPrivateTransaction(parsedTransaction, publicTransactionHash);
        }, function (error) {
            error.transaction = _this.formatter.transaction(signedTransaction);
            if (error.transaction.hash) {
                error.transactionHash = error.transaction.hash;
            }
            throw error;
        });
    };
    PrivateJsonRpcProvider.prototype._wrapPrivateTransaction = function (tx, publicTransactionHash) {
        var _this = this;
        if (publicTransactionHash != null && bytes_1.hexDataLength(publicTransactionHash) !== 32) {
            errors.throwArgumentError("invalid public transaction hash", "publicTransactionHash", publicTransactionHash);
        }
        var result = tx;
        tx.publicHash = publicTransactionHash;
        result.wait = function (confirmations) {
            // We know this transaction *must* exist (whether it gets mined is
            // another story), so setting an emitted value forces us to
            // wait even if the node returns null for the receipt
            if (confirmations !== 0) {
                _this._emitted["t:" + tx.publicHash] = "pending";
            }
            // wait for the public marker transaction to be mined
            return _this.waitForTransaction(tx.publicHash, confirmations).then(function (receipt) {
                if (receipt == null && confirmations === 0) {
                    return null;
                }
                // No longer pending, allow the polling loop to garbage collect this
                _this._emitted["t:" + tx.publicHash] = receipt.blockNumber;
                if (receipt.status === 0) {
                    errors.throwError("transaction failed", errors.CALL_EXCEPTION, {
                        publicHash: tx.publicHash,
                        transaction: tx
                    });
                }
                // get private transaction receipt
                return receipt;
            });
        };
        return result;
    };
    PrivateJsonRpcProvider.prototype.getPrivateTransactionCount = function (addressOrName, privacyGroupOptions) {
        var _this = this;
        return this._runPerform("getPrivateTransactionCount", {
            address: function () { return _this._getAddress(addressOrName); },
            privacyGroupId: function () { return Promise.resolve(privacyGroup_1.generatePrivacyGroup(privacyGroupOptions)); },
        }).then(function (result) {
            return bignumber_1.BigNumber.from(result).toNumber();
        });
    };
    PrivateJsonRpcProvider.prototype.getPrivateTransactionReceipt = function (publicTransactionHash) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties({ transactionHash: publicTransactionHash }).then(function (_a) {
                var transactionHash = _a.transactionHash;
                var params = { transactionHash: _this.formatter.hash(transactionHash, true) };
                return web_1.poll(function () {
                    return _this.perform("getPrivateTransactionReceipt", params).then(function (result) {
                        if (result == null) {
                            if (_this._emitted["t:" + transactionHash] == null) {
                                return null;
                            }
                            return undefined;
                        }
                        var receipt = _this.formatter.privateReceipt(result);
                        return receipt;
                    }).then(function (privateReceipt) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            if (privateReceipt == undefined || privateReceipt == null) {
                                return [2 /*return*/, privateReceipt];
                            }
                            return [2 /*return*/, this.getTransactionReceipt(publicTransactionHash).then(function (result) {
                                    var publicReceipt = _this.formatter.receipt(result);
                                    // Merge the public and private transaction receipts
                                    var receipt = __assign({}, publicReceipt, { contractAddress: privateReceipt.contractAddress, logs: privateReceipt.logs, from: privateReceipt.from, to: privateReceipt.to, output: privateReceipt.output });
                                    if (receipt.blockNumber == null) {
                                        receipt.confirmations = 0;
                                    }
                                    else if (receipt.confirmations == null) {
                                        return _this._getFastBlockNumber().then(function (blockNumber) {
                                            // Add the confirmations using the fast block number (pessimistic)
                                            var confirmations = (blockNumber - receipt.blockNumber) + 1;
                                            if (confirmations <= 0) {
                                                confirmations = 1;
                                            }
                                            receipt.confirmations = confirmations;
                                            return receipt;
                                        });
                                    }
                                    return receipt;
                                })];
                        });
                    }); }).catch(function (err) {
                        errors.throwError("Failed to get private transaction receipt. Error: " + err.message, err.code, {
                            err: err,
                            publicTransactionHash: publicTransactionHash,
                        });
                    });
                }, { onceBlock: _this });
            });
        });
    };
    PrivateJsonRpcProvider.prototype.getPrivateTransaction = function (transactionHash) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties({ transactionHash: transactionHash }).then(function (_a) {
                var transactionHash = _a.transactionHash;
                var params = { transactionHash: _this.formatter.hash(transactionHash, true) };
                return web_1.poll(function () {
                    return _this.perform("getPrivateTransaction", params).then(function (result) {
                        if (result == null) {
                            if (_this._emitted["t:" + transactionHash] == null) {
                                return null;
                            }
                            return undefined;
                        }
                        var tx = _this.formatter.privateTransactionResponse(result);
                        // TODO does this work for private transactions?
                        if (tx.blockNumber == null) {
                            tx.confirmations = 0;
                        }
                        else if (tx.confirmations == null) {
                            return _this._getFastBlockNumber().then(function (blockNumber) {
                                // Add the confirmations using the fast block number (pessimistic)
                                var confirmations = (blockNumber - tx.blockNumber) + 1;
                                if (confirmations <= 0) {
                                    confirmations = 1;
                                }
                                tx.confirmations = confirmations;
                                return _this._wrapPrivateTransaction(tx);
                            });
                        }
                        return _this._wrapPrivateTransaction(tx);
                    });
                }, { onceBlock: _this });
            });
        });
    };
    PrivateJsonRpcProvider.prototype.createPrivacyGroup = function (members, name, description) {
        return this._runPerform("createPrivacyGroup", {
            members: function () { return Promise.resolve(members); },
            name: function () { return Promise.resolve(name); },
            description: function () { return Promise.resolve(description); },
        });
    };
    PrivateJsonRpcProvider.prototype.deletePrivacyGroup = function (privacyGroupId) {
        return this._runPerform("deletePrivacyGroup", {
            privacyGroupId: function () { return Promise.resolve(privacyGroupId); },
        });
    };
    PrivateJsonRpcProvider.prototype.findPrivacyGroup = function (members) {
        return this._runPerform("findPrivacyGroup", {
            members: function () { return Promise.resolve(members); },
        });
    };
    PrivateJsonRpcProvider.prototype.getPrivacyPrecompileAddress = function () {
        return this._runPerform("getPrivacyPrecompileAddress", {});
    };
    // Pantheon administration
    PrivateJsonRpcProvider.prototype.addPeer = function (enodeUrl) {
        return this._runPerform("addPeer", {
            enodeUrl: function () { return Promise.resolve(enodeUrl); }
        });
    };
    PrivateJsonRpcProvider.prototype.changeLogLevel = function (level) {
        return this._runPerform("changeLogLevel", {
            level: function () { return Promise.resolve(level); }
        });
    };
    PrivateJsonRpcProvider.prototype.getNodeInfo = function () {
        return this._runPerform("getNodeInfo", {});
    };
    PrivateJsonRpcProvider.prototype.getPeers = function () {
        return this._runPerform("getPeers", {});
    };
    PrivateJsonRpcProvider.prototype.removePeer = function (enodeUrl) {
        return this._runPerform("removePeer", {
            enodeUrl: function () { return Promise.resolve(enodeUrl); }
        });
    };
    PrivateJsonRpcProvider.prototype.getModuleVersions = function () {
        return this._runPerform("getModuleVersions", {});
    };
    PrivateJsonRpcProvider.prototype.getPantheonStatistics = function () {
        return this._runPerform("getPantheonStatistics", {});
    };
    PrivateJsonRpcProvider.prototype.getPantheonTransactions = function () {
        return this._runPerform("getPantheonTransactions", {});
    };
    // Override the base perform method to add the pantheon
    // calls
    PrivateJsonRpcProvider.prototype.perform = function (method, params) {
        switch (method) {
            // privacy transactions
            case "sendPrivateTransaction":
                // method overridden to use EEA send raw transaction
                return this.send("eea_sendRawTransaction", [params.signedTransaction])
                    .catch(function (error) {
                    if (error.responseText) {
                        // "insufficient funds for gas * price + value"
                        if (error.responseText.indexOf("insufficient funds") > 0) {
                            errors.throwError("insufficient funds", errors.INSUFFICIENT_FUNDS, {});
                        }
                        // "nonce too low"
                        if (error.responseText.indexOf("nonce too low") > 0) {
                            errors.throwError("nonce has already been used", errors.NONCE_EXPIRED, {});
                        }
                        // "replacement transaction underpriced"
                        if (error.responseText.indexOf("replacement transaction underpriced") > 0) {
                            errors.throwError("replacement fee too low", errors.REPLACEMENT_UNDERPRICED, {});
                        }
                    }
                    throw error;
                });
            case "privateCall":
                return this.send("priv_call", [params.transaction, params.privacyGroupId]);
            case "getPrivateTransactionCount":
                return this.send("priv_getTransactionCount", [getLowerCase(params.address), params.privacyGroupId]);
            case "getPrivateTransactionReceipt":
                return this.send("eea_getTransactionReceipt", [params.transactionHash]);
            case "getPrivateTransaction":
                return this.send("priv_getPrivateTransaction", [params.transactionHash]);
            // Privacy group management
            case "createPrivacyGroup":
                return this.send("priv_createPrivacyGroup", [
                    params.members,
                    params.name,
                    params.description
                ]);
            case "deletePrivacyGroup":
                return this.send("priv_deletePrivacyGroup", [params.privacyGroupId]);
            case "findPrivacyGroup":
                return this.send("priv_findPrivacyGroup", [params.members]);
            case "getPrivacyPrecompileAddress":
                return this.send("priv_getPrivacyPrecompileAddress", []);
            // Pantheon administration
            case "addPeer":
                return this.send("admin_addPeer", [
                    params.enodeUrl
                ]);
            case "changeLogLevel":
                return this.send("admin_changeLogLevel", [
                    params.level
                ]);
            case "getNodeInfo":
                return this.send("admin_nodeInfo", []);
            case "getPeers":
                return this.send("admin_peers", []);
            case "removePeer":
                return this.send("admin_removePeer", [
                    params.enodeUrl
                ]);
            case "getModuleVersions":
                return this.send("rpc_modules", []);
            case "getPantheonStatistics":
                return this.send("txpool_pantheonStatistics", []);
            case "getPantheonTransactions":
                return this.send("txpool_pantheonTransactions", []);
            default:
                return _super.prototype.perform.call(this, method, params);
        }
    };
    // Convert an ethers.js transaction into a JSON-RPC transaction
    //  - gasLimit => gas
    //  - All values hexlified
    //  - All numeric values zero-striped
    // NOTE: This allows a TransactionRequest, but all values should be resolved
    //       before this is called
    PrivateJsonRpcProvider.hexlifyTransaction = function (transaction, allowExtra) {
        // Check only allowed properties are given
        var allowed = properties_1.shallowCopy(privateTransaction_1.allowedTransactionKeys);
        if (allowExtra) {
            for (var key in allowExtra) {
                if (allowExtra[key]) {
                    allowed[key] = true;
                }
            }
        }
        properties_1.checkProperties(transaction, allowed);
        var result = {};
        // Some nodes (INFURA ropsten; INFURA mainnet is fine) do not like leading zeros.
        ["gasLimit", "gasPrice", "nonce", "value"].forEach(function (key) {
            if (transaction[key] == null) {
                return;
            }
            var value = bytes_1.hexValue(transaction[key]);
            if (key === "gasLimit") {
                key = "gas";
            }
            result[key] = value;
        });
        ["from", "to", "data"].forEach(function (key) {
            if (transaction[key] == null) {
                return;
            }
            result[key] = bytes_2.hexlify(transaction[key]);
        });
        // Add extra EEA transaction keys
        ["privateFrom", "privateFor", "restricted"].forEach(function (key) {
            if (transaction[key] == null) {
                return;
            }
            result[key] = bytes_2.hexlify(transaction[key]);
        });
        return result;
    };
    return PrivateJsonRpcProvider;
}(providers_1.JsonRpcProvider));
exports.PrivateJsonRpcProvider = PrivateJsonRpcProvider;
