"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var errors = __importStar(require("@ethersproject/errors"));
var RegEx = __importStar(require("./utils/RegEx"));
function getPrivateAddress(privateAddress) {
    if (typeof (privateAddress) !== "string") {
        errors.throwArgumentError("invalid private address. Not a string", "private address", privateAddress);
    }
    if (privateAddress.match(RegEx.bytes)) {
        // 32 bytes hexadecimal encoded with 0x prefix gives 64 + 2 = 66 characters
        if (privateAddress.length === 66) {
            // convert to hex to string in base64 encoding
            var buf = Buffer.from(privateAddress.substring(2), 'hex');
            return buf.toString('base64');
        }
        else {
            return errors.throwArgumentError("invalid hexadecimal encoded private address. Length " + privateAddress.length + " and not 66", "private address", privateAddress);
        }
    }
    // strip 0x prefix
    if (privateAddress.substring(0, 2) === '0x') {
        privateAddress = privateAddress.substring(2);
    }
    // If base64 encoded
    if (privateAddress.match(RegEx.base64)) {
        if (privateAddress.length === 44) {
            return privateAddress;
        }
        else {
            return errors.throwArgumentError("invalid base64 encoded private address. Length " + privateAddress.length + " and not 44", "private address", privateAddress);
        }
    }
    return errors.throwArgumentError("invalid private address. No hexadecimal or base64 encoded", "private address", privateAddress);
}
exports.getPrivateAddress = getPrivateAddress;
