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
Object.defineProperty(exports, "__esModule", { value: true });
var address_1 = require("@ethersproject/address");
var keccak256_1 = require("@ethersproject/keccak256");
var properties_1 = require("@ethersproject/properties");
var logger_1 = require("@ethersproject/logger");
var wallet_1 = require("@ethersproject/wallet");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var privateTransaction_1 = require("./privateTransaction");
var allowedPrivateTransactionKeys = [
    "chainId", "data", "from", "gasLimit", "gasPrice", "nonce", "to", "value",
    // EEA keys
    "privateFrom", "privateFor", "restriction",
];
var PrivateWallet = /** @class */ (function (_super) {
    __extends(PrivateWallet, _super);
    function PrivateWallet() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PrivateWallet.prototype.privateCall = function (transaction) {
        return this.sendPrivateTransaction(transaction)
            .then(function (response) {
            // Wait for the transaction to be mined and the receipt returned
            return response.wait();
        })
            .then(function (receipt) {
            return receipt.output;
        });
    };
    PrivateWallet.prototype.signPrivateTransaction = function (transaction) {
        var _this = this;
        return properties_1.resolveProperties(transaction).then(function (tx) {
            if (tx.from != null) {
                if (address_1.getAddress(tx.from) !== _this.address) {
                    throw new Error("transaction from address mismatch");
                }
                delete tx.from;
            }
            var signature = _this._signingKey().signDigest(keccak256_1.keccak256(privateTransaction_1.serialize(tx)));
            return privateTransaction_1.serialize(tx, signature);
        });
    };
    PrivateWallet.prototype.sendPrivateTransaction = function (transaction) {
        var _this = this;
        this._checkProvider("sendTransaction");
        return this.populatePrivateTransaction(transaction).then(function (tx) {
            return _this.signPrivateTransaction(tx).then(function (signedTx) {
                return _this.provider.sendPrivateTransaction(signedTx);
            });
        });
    };
    // Populates ALL keys for a transaction and checks that "from" matches
    // this Signer. Should be used by sendTransaction but NOT by signTransaction.
    // By default called from: (overriding these prevents it)
    //   - sendTransaction
    PrivateWallet.prototype.populatePrivateTransaction = function (transaction) {
        var _this = this;
        return properties_1.resolveProperties(this.checkTransaction(transaction)).then(function (tx) {
            if (tx.to != null) {
                tx.to = Promise.resolve(tx.to).then(function (to) { return _this.resolveName(to); });
            }
            if (tx.gasPrice == null) {
                tx.gasPrice = _this.getGasPrice();
            }
            if (tx.nonce == null) {
                tx.nonce = _this.provider.getPrivateTransactionCount(_this.getAddress(), transaction);
            }
            // Make sure any provided address matches this signer
            if (tx.from == null) {
                tx.from = _this.getAddress();
            }
            else {
                tx.from = Promise.all([
                    _this.getAddress(),
                    _this.provider.resolveName(tx.from)
                ]).then(function (results) {
                    if (results[0] !== results[1]) {
                        logger.throwArgumentError("from address mismatch", "transaction", transaction);
                    }
                    return results[0];
                });
            }
            if (tx.gasLimit == null) {
                // FIXME can't estimate gas until Besu implements eea_estimateGas
                // eth_estimateGas can not estimate private transactions
                // dirty hack for now is to just set the gasLimit to something large
                tx.gasLimit = 10000000;
                // tx.gasLimit = this.estimateGas(tx);
            }
            if (tx.chainId == null) {
                tx.chainId = _this.getChainId();
            }
            return properties_1.resolveProperties(tx);
        });
    };
    PrivateWallet.prototype.checkTransaction = function (transaction) {
        for (var key in transaction) {
            if (allowedPrivateTransactionKeys.indexOf(key) === -1) {
                logger.throwArgumentError("invalid transaction key: " + key, "transaction", transaction);
            }
        }
        var tx = properties_1.shallowCopy(transaction);
        if (tx.from == null) {
            tx.from = this.getAddress();
        }
        return tx;
    };
    return PrivateWallet;
}(wallet_1.Wallet));
exports.PrivateWallet = PrivateWallet;
