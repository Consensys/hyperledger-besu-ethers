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
        return this.sendPrivateUncheckedTransaction(transaction).then(function (hash) {
            return web_1.poll(function () {
                return _this.provider.getPrivateTransaction(hash).then(function (tx) {
                    if (tx === null) {
                        return undefined;
                    }
                    return _this.provider._wrapPrivateTransaction(tx, hash);
                });
            }, { onceBlock: _this.provider }).catch(function (error) {
                error.transactionHash = hash;
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
    PrivateJsonRpcProvider.prototype.privateCall = function (transaction, privacyGroupOptions) {
        var _this = this;
        return this._runPerform("privateCall", {
            transaction: function () { return _this._getTransactionRequest(transaction); },
            privacyGroupId: function () { return Promise.resolve(privacyGroup_1.generatePrivacyGroup(privacyGroupOptions)); },
        }).then(function (result) {
            return bytes_2.hexlify(result);
        });
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
        }).then(function (result) {
            var parsedTransaction = _this.formatter.transaction(signedTransaction);
            return _this._wrapPrivateTransaction(parsedTransaction, result);
        }, function (error) {
            error.transaction = _this.formatter.transaction(signedTransaction);
            if (error.transaction.hash) {
                error.transactionHash = error.transaction.hash;
            }
            throw error;
        });
    };
    PrivateJsonRpcProvider.prototype._wrapPrivateTransaction = function (tx, publicHash) {
        var _this = this;
        if (publicHash != null && bytes_1.hexDataLength(publicHash) !== 32) {
            errors.throwArgumentError("invalid public hash", "publicHash", publicHash);
        }
        var result = tx;
        tx.publicHash = publicHash;
        // @TODO: (confirmations? number, timeout? number)
        result.wait = function (confirmations) {
            // We know this transaction *must* exist (whether it gets mined is
            // another story), so setting an emitted value forces us to
            // wait even if the node returns null for the receipt
            if (confirmations !== 0) {
                _this._emitted["t:" + tx.publicHash] = "pending";
            }
            return _this.waitForPrivateTransaction(tx.publicHash, confirmations).then(function (receipt) {
                if (receipt == null && confirmations === 0) {
                    return null;
                }
                // No longer pending, allow the polling loop to garbage collect this
                _this._emitted["t:" + tx.publicHash] = receipt.blockNumber;
                // FIXME add once eea_getTransactionReceipt includes the status gasUsed and cumulativeGasUsed
                // if (receipt.status === 0) {
                //     errors.throwError("transaction failed", errors.CALL_EXCEPTION, {
                //         publicHash: tx.publicHash,
                //         transaction: tx
                //     });
                // }
                return receipt;
            });
        };
        return result;
    };
    PrivateJsonRpcProvider.prototype.waitForPrivateTransaction = function (transactionHash, confirmations) {
        var _this = this;
        if (confirmations == null) {
            confirmations = 1;
        }
        if (confirmations === 0) {
            return this.getPrivateTransactionReceipt(transactionHash);
        }
        return new Promise(function (resolve) {
            var handler = function (receipt) {
                // is this a private or public transaction?
                // We only want want private transactions which do not have a gasUsed property on the receipt
                // if (!receipt.hasOwnProperty('gasUsed')) {
                if (receipt.confirmations < confirmations) {
                    return;
                }
                _this.removeListener(transactionHash, handler);
                resolve(receipt);
                // }
            };
            _this.on(transactionHash, handler);
        });
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
    PrivateJsonRpcProvider.prototype.getPrivateTransactionReceipt = function (privateTransactionHash) {
        var _this = this;
        return this.ready.then(function () {
            return properties_1.resolveProperties({ transactionHash: privateTransactionHash }).then(function (_a) {
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
                    }).catch(function (err) {
                        errors.throwError("Failed to get private transaction receipt. Error: " + err.message, err.code, {
                            err: err,
                            privateTransactionHash: privateTransactionHash,
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
