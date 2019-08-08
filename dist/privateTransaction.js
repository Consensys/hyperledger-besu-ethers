"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var address_1 = require("@ethersproject/address");
var bignumber_1 = require("@ethersproject/bignumber");
var bytes_1 = require("@ethersproject/bytes");
var constants_1 = require("@ethersproject/constants");
var properties_1 = require("@ethersproject/properties");
var keccak256_1 = require("@ethersproject/keccak256");
var signing_key_1 = require("@ethersproject/signing-key");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var privateAddress_1 = require("./privateAddress");
var bytes_2 = require("./bytes");
var RLP = __importStar(require("./rlp"));
function handleAddress(value) {
    if (value === "0x") {
        return null;
    }
    return address_1.getAddress(value);
}
function handleNumber(value) {
    if (value === "0x") {
        return constants_1.Zero;
    }
    return bignumber_1.BigNumber.from(value);
}
function handlePrivateAddress(value) {
    if (value === "0x") {
        return value;
    }
    return privateAddress_1.getPrivateAddress(value);
}
function handlePrivateFor(privateFor) {
    if (Array.isArray(privateFor)) {
        var result_1 = [];
        privateFor.forEach(function (address) {
            result_1.push(handlePrivateAddress(address));
        });
        return result_1;
    }
    else {
        // privateFor must contain privacyGroupId
        return handlePrivateAddress(privateFor);
    }
}
// converts hexadecimal encoded string back into a string
function handleString(value) {
    // strip the 0x prefix before converting hex string to a Buffer
    var stringBuf = Buffer.from(value.substring(2), 'hex');
    // convert Buffer to a utf8 string
    return stringBuf.toString();
}
var transactionFields = [
    { name: 'nonce', maxLength: 32 },
    { name: 'gasPrice', maxLength: 32 },
    { name: 'gasLimit', maxLength: 32 },
    { name: 'to', length: 20 },
    { name: 'value', maxLength: 32 },
    { name: 'data' },
    { name: 'chainId' },
    // Extra EEA privacy properties
    { name: 'privateFrom' },
    { name: 'privateFor' },
    { name: 'restriction' },
];
exports.allowedTransactionKeys = {
    chainId: true, data: true, gasLimit: true, gasPrice: true, nonce: true, to: true, value: true,
    // EEA fields
    privateFrom: true, privateFor: true, restriction: true
};
function computeAddress(key) {
    var publicKey = signing_key_1.computePublicKey(key);
    return address_1.getAddress(bytes_1.hexDataSlice(keccak256_1.keccak256(bytes_1.hexDataSlice(publicKey, 1)), 12));
}
exports.computeAddress = computeAddress;
function recoverAddress(digest, signature) {
    return computeAddress(signing_key_1.recoverPublicKey(bytes_2.arrayify(digest), signature));
}
exports.recoverAddress = recoverAddress;
;
function serialize(transaction, signature) {
    properties_1.checkProperties(transaction, exports.allowedTransactionKeys);
    var raw = [];
    transactionFields.forEach(function (fieldInfo) {
        var value = transaction[fieldInfo.name] || ([]);
        if (fieldInfo.name === 'restriction' && !transaction.restriction) {
            value = 'restricted';
        }
        if (fieldInfo.name === 'privateFor') {
            if (Array.isArray(value)) {
                // Convert items of the array to bytes
                value = value.map(function (v) {
                    return Buffer.from(v, 'base64');
                });
                raw.push(value);
                return;
            }
            else {
                value = Buffer.from(value, 'base64');
            }
        }
        else if (fieldInfo.name === 'privateFrom') {
            if (value === '0x') {
                value = Buffer.from([]);
            }
            else {
                value = Buffer.from(value, 'base64');
            }
        }
        else {
            value = bytes_2.arrayify(bytes_2.hexlify(value));
        }
        // Fixed-width field
        if (fieldInfo.length && value.length !== fieldInfo.length && value.length > 0) {
            logger.throwArgumentError("invalid length for " + fieldInfo.name, ("transaction:" + fieldInfo.name), value);
        }
        // Variable-width (with a maximum)
        if (fieldInfo.maxLength) {
            value = bytes_1.stripZeros(value);
            if (value.length > fieldInfo.maxLength) {
                logger.throwArgumentError("invalid length for " + fieldInfo.name, ("transaction:" + fieldInfo.name), value);
            }
        }
        if (fieldInfo.name === 'chainId') {
            if (transaction.chainId != null && transaction.chainId !== 0) {
                raw.push(bytes_2.hexlify(value)); // v
            }
            else {
                raw.push("0x"); // v
            }
            raw.push("0x"); // r
            raw.push("0x"); // s
        }
        else {
            raw.push(bytes_2.hexlify(value));
        }
    });
    var unsignedTransaction = RLP.encode(raw);
    // Requesting an unsigned transaction
    if (!signature) {
        return unsignedTransaction;
    }
    // The splitSignature will ensure the transaction has a recoveryParam in the
    // case that the signTransaction function only adds a v.
    var sig = bytes_1.splitSignature(signature);
    var v = 27 + sig.recoveryParam;
    v += transaction.chainId * 2 + 8;
    raw[6] = bytes_2.hexlify(v);
    raw[7] = bytes_1.stripZeros(bytes_2.arrayify(sig.r));
    raw[8] = bytes_1.stripZeros(bytes_2.arrayify(sig.s));
    return RLP.encode(raw);
}
exports.serialize = serialize;
function parse(rawTransaction) {
    var transaction = RLP.decode(rawTransaction);
    if (transaction.length !== 12) {
        logger.throwArgumentError("invalid raw transaction. Has " + transaction.length + " fields, expecting " + 12, "rawTransaction", rawTransaction);
    }
    var tx = {
        nonce: handleNumber(transaction[0]).toNumber(),
        gasPrice: handleNumber(transaction[1]),
        gasLimit: handleNumber(transaction[2]),
        to: handleAddress(transaction[3]),
        value: handleNumber(transaction[4]),
        data: transaction[5],
        chainId: 0,
        privateFrom: handlePrivateAddress(transaction[9]),
        privateFor: handlePrivateFor(transaction[10]),
        // @ts-ignore parse value may not be restricted or unrestricted
        restriction: handleString(transaction[11]),
    };
    try {
        tx.v = bignumber_1.BigNumber.from(transaction[6]).toNumber();
    }
    catch (error) {
        console.log(error);
        return tx;
    }
    tx.r = bytes_1.hexZeroPad(transaction[7], 32);
    tx.s = bytes_1.hexZeroPad(transaction[8], 32);
    if (bignumber_1.BigNumber.from(tx.r).isZero() && bignumber_1.BigNumber.from(tx.s).isZero()) {
        // EIP-155 unsigned transaction
        tx.chainId = tx.v;
        tx.v = 0;
    }
    else {
        // Signed Transaction
        tx.chainId = Math.floor((tx.v - 35) / 2);
        if (tx.chainId < 0) {
            tx.chainId = 0;
        }
        var recoveryParam = tx.v - 27;
        if (tx.chainId !== 0) {
            transaction[6] = bytes_2.hexlify(tx.chainId);
            transaction[7] = "0x";
            transaction[8] = "0x";
            recoveryParam -= tx.chainId * 2 + 8;
        }
        var digest = keccak256_1.keccak256(RLP.encode(transaction));
        try {
            tx.from = recoverAddress(digest, { r: bytes_2.hexlify(tx.r), s: bytes_2.hexlify(tx.s), recoveryParam: recoveryParam });
        }
        catch (error) {
            console.log(error);
        }
        tx.privateHash = keccak256_1.keccak256(rawTransaction);
    }
    return tx;
}
exports.parse = parse;
