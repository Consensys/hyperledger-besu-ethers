"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bytes_1 = require("@ethersproject/bytes");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
// the following two functions are not currently exported from @ethersproject/bytes
// so need to declare here
function isHexable(value) {
    return !!(value.toHexString);
}
function addSlice(array) {
    if (array.slice) {
        return array;
    }
    array.slice = function () {
        var args = Array.prototype.slice.call(arguments);
        return addSlice(new Uint8Array(Array.prototype.slice.apply(array, args)));
    };
    return array;
}
function arrayify(value, options) {
    if (!options) {
        options = {};
    }
    if (typeof (value) === "number") {
        logger.checkSafeUint53(value, "invalid arrayify value");
        var result = [];
        while (value) {
            result.unshift(value & 0xff);
            value /= 256;
        }
        if (result.length === 0) {
            result.push(0);
        }
        return addSlice(new Uint8Array(result));
    }
    if (options.allowMissingPrefix && typeof (value) === "string" && value.substring(0, 2) !== "0x") {
        value = "0x" + value;
    }
    if (isHexable(value)) {
        value = value.toHexString();
    }
    if (bytes_1.isHexString(value)) {
        var hex = value.substring(2);
        if (!options.allowOddLength && hex.length % 2) {
            logger.throwArgumentError("hex data is odd-length", "value", value);
        }
        var result = [];
        for (var i = 0; i < hex.length; i += 2) {
            result.push(parseInt(hex.substring(i, i + 2), 16));
        }
        return addSlice(new Uint8Array(result));
    }
    // The transaction option restriction is a string so need to handle
    if (typeof (value) === 'string') {
        var result = Buffer.from(value);
        return addSlice(new Uint8Array(result));
    }
    if (bytes_1.isBytes(value)) {
        return addSlice(new Uint8Array(value));
    }
    return logger.throwArgumentError("invalid arrayify value", "value", value);
}
exports.arrayify = arrayify;
var HexCharacters = "0123456789abcdef";
function hexlify(value, options) {
    if (!options) {
        options = {};
    }
    if (typeof (value) === "number") {
        logger.checkSafeUint53(value, "invalid hexlify value");
        var hex = "";
        while (value) {
            hex = HexCharacters[value & 0x0f] + hex;
            value = Math.floor(value / 16);
        }
        if (hex.length) {
            if (hex.length % 2) {
                hex = "0" + hex;
            }
            return "0x" + hex;
        }
        return "0x00";
    }
    if (options.allowMissingPrefix && typeof (value) === "string" && value.substring(0, 2) !== "0x") {
        value = "0x" + value;
    }
    if (isHexable(value)) {
        return value.toHexString();
    }
    if (bytes_1.isHexString(value)) {
        if (!options.allowOddLength && value.length % 2) {
            logger.throwArgumentError("hex data is odd-length", "value", value);
        }
        return value.toLowerCase();
    }
    // The transaction option restriction is a string so need to handle
    if (typeof (value) === 'string') {
        // Convert to bytes so it can be converted to hex by the bytes conversion
        value = Buffer.from(value);
    }
    if (bytes_1.isBytes(value)) {
        var result = "0x";
        for (var i = 0; i < value.length; i++) {
            var v = value[i];
            result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
        }
        return result;
    }
    return logger.throwArgumentError("invalid hexlify value", "value", value);
}
exports.hexlify = hexlify;
