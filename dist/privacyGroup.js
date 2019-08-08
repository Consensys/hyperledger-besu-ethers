"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var keccak256_1 = require("@ethersproject/keccak256");
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
var RLP = __importStar(require("./rlp"));
var RegEx = __importStar(require("./utils/RegEx"));
// This logic has been derived from the PagaSys's EEA Web3js client
// https://github.com/PegaSysEng/web3js-eea/blob/master/src/index.js
function generatePrivacyGroup(privacyGroupOptions) {
    if (typeof (privacyGroupOptions) !== 'object') {
        logger.throwArgumentError("invalid PrivacyGroupOptions as not an object", "privacyGroupOptions", privacyGroupOptions);
    }
    // if privateFor is a string then it should be the privacy group id
    if (typeof (privacyGroupOptions.privateFor) === 'string') {
        if (privacyGroupOptions.privateFor.match(RegEx.base64) &&
            privacyGroupOptions.privateFor.length === 44) {
            return privacyGroupOptions.privateFor;
        }
        else {
            throw logger.makeError("invalid privateFor. When set to the privacy group, it needs to be a base64 encoded string of 44 characters", "privacyGroupOptions.privateFor", privacyGroupOptions);
        }
    }
    // throw if privateFor is not a string, not an array or an empty array
    if (!Array.isArray(privacyGroupOptions.privateFor)) {
        logger.throwArgumentError("invalid privateFor. Has to be array of base64 encoded strings or the base64 encoded privacy group", "privacyGroupOptions.privateFor", privacyGroupOptions);
    }
    if (privacyGroupOptions.privateFor.length === 0) {
        logger.throwArgumentError("invalid privateFor. Empty array of base64 encoded strings", "privacyGroupOptions.privateFor", privacyGroupOptions);
    }
    if (typeof (privacyGroupOptions.privateFrom) !== 'string' ||
        !privacyGroupOptions.privateFrom.match(RegEx.base64) ||
        privacyGroupOptions.privateFrom.length !== 44) {
        logger.throwArgumentError("invalid privateFrom. Has to be base64 encoded string of 44 characters", "privacyGroupOptions.privateFrom", privacyGroupOptions);
    }
    privacyGroupOptions.privateFor.forEach(function (privateAddress) {
        if (typeof (privateAddress) !== 'string' ||
            !privateAddress.match(RegEx.base64) ||
            privateAddress.length !== 44) {
            logger.throwArgumentError("invalid privateFor. When an array, it needs to be base64 encoded strings of 44 characters", "privacyGroupOptions.privateFor", privacyGroupOptions);
        }
    });
    var publicAddresses = privacyGroupOptions.privateFor.concat(privacyGroupOptions.privateFrom);
    var participants = publicAddresses.map(function (publicKey) {
        var buffer = Buffer.from(publicKey, "base64");
        var hash = 1;
        buffer.forEach(function (value) {
            // Do some tricky bit operations
            hash = (31 * hash + ((value << 24) >> 24)) & 0xffffffff;
        });
        return { buffer: buffer, hash: hash };
    })
        .sort(function (a, b) { return a.hash - b.hash; })
        .map(function (x) { return x.buffer; });
    // RLP encode the array of buffers sorted by hash
    var rlp = RLP.encode(participants);
    // Get the hash of the rlp encoding
    var rlpHash = keccak256_1.keccak256(rlp);
    // Need to strip the 0x prefix from the hex string before converting to a buffer
    var rlpHashBuf = Buffer.from(rlpHash.substring(2), 'hex');
    // Return base64 encoded
    return rlpHashBuf.toString('base64');
}
exports.generatePrivacyGroup = generatePrivacyGroup;
;
