"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ethereumAddress = /^0x([A-Fa-f0-9]{40})$/;
exports.bytes = /^0x([A-Fa-f0-9]{1,})$/;
exports.bytes32 = /^0x([A-Fa-f0-9]{64})$/;
exports.bytes64 = /^0x([A-Fa-f0-9]{128})$/;
exports.transactionHash = exports.bytes32;
// Does not match an empty base64 string
// Sourced from https://stackoverflow.com/a/5885097
exports.base64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
