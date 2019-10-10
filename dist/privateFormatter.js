'use strict';
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var providers_1 = require("@ethersproject/providers");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var privateTransaction_1 = require("./privateTransaction");
var RegEx = __importStar(require("./utils/RegEx"));
// Override the formatting of the transaction as it now includes the new EEA
var PrivateFormatter = /** @class */ (function (_super) {
    __extends(PrivateFormatter, _super);
    function PrivateFormatter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PrivateFormatter.prototype.getDefaultFormats = function () {
        var superFormats = _super.prototype.getDefaultFormats.call(this);
        // Override default formats with EeaFormat
        return __assign({}, superFormats, { 
            // Format of API response of priv_getTransactionReceipt
            // which is called in PrivateJsonRpcProvider.getPrivateTransactionReceipt
            privateReceipt: {
                to: providers_1.Formatter.allowNull(this.address, null),
                from: providers_1.Formatter.allowNull(this.address, null),
                contractAddress: providers_1.Formatter.allowNull(this.address.bind(this), null),
                logs: providers_1.Formatter.arrayOf(this.receiptLog.bind(this)),
                output: providers_1.Formatter.allowNull(this.data.bind(this)),
                blockNumber: providers_1.Formatter.allowNull(this.number, null),
                confirmations: providers_1.Formatter.allowNull(this.number, null),
            }, privateTransaction: __assign({}, superFormats.transaction, { publicHash: providers_1.Formatter.allowNull(null, null), privateHash: this.hash.bind(this), 
                // Add extra EEA fields
                privateFrom: providers_1.Formatter.allowNull(this.privateAddress, null), privateFor: this.privateFor.bind(this), restriction: this.restriction }) });
    };
    PrivateFormatter.prototype.privateAddress = function (privateAddress) {
        if (!privateAddress) {
            return null;
        }
        if (typeof privateAddress === 'string' &&
            privateAddress.match(RegEx.base64) &&
            privateAddress.length === 44) {
            return privateAddress;
        }
        throw logger.makeError('invalid private address. Has to be base64 encoded string of 44 characters.', 'privateAddress', privateAddress);
    };
    PrivateFormatter.prototype.privateFor = function (privateFor) {
        if (!privateFor) {
            return null;
        }
        try {
            if (Array.isArray(privateFor)) {
                for (var _i = 0, privateFor_1 = privateFor; _i < privateFor_1.length; _i++) {
                    var privAddress = privateFor_1[_i];
                    this.privateAddress(privAddress);
                }
                return privateFor;
            }
            return this.privateAddress(privateFor);
        }
        catch (err) {
            throw logger.makeError('invalid privateFor. Has to be base64 encoded string or an array of base64 encoded strings.', 'privateFor', privateFor);
        }
    };
    PrivateFormatter.prototype.restriction = function (restriction) {
        if (!restriction) {
            return null;
        }
        if (restriction === 'restricted' || restriction === 'unrestricted') {
            return restriction;
        }
        throw logger.makeError('invalid restriction. Must be either \'restricted\' or \'unrestricted\'.', 'InvalidRestriction', { restriction: restriction });
    };
    PrivateFormatter.prototype.transaction = function (value) {
        return privateTransaction_1.parse(value);
    };
    PrivateFormatter.prototype.privateReceipt = function (value) {
        return providers_1.Formatter.check(this.formats.privateReceipt, value);
    };
    PrivateFormatter.prototype.privateTransactionResponse = function (transaction) {
        // Rename input to data
        if (transaction.input != null && transaction.data == null) {
            transaction.data = transaction.input;
        }
        // Rename gas to gasLimit
        if (transaction.gas != null && transaction.gasLimit == null) {
            transaction.gasLimit = transaction.gas;
        }
        // Rename hash to privateHash
        if (transaction.hash != null && transaction.privateHash == null) {
            transaction.privateHash = transaction.hash;
        }
        // we don't have enough information to set the hash of the public market transaction
        transaction.publicHash = null;
        var result = providers_1.Formatter.check(this.formats.privateTransaction, transaction);
        return result;
    };
    return PrivateFormatter;
}(providers_1.Formatter));
exports.PrivateFormatter = PrivateFormatter;
