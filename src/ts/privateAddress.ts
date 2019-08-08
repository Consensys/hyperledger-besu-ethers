

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";

const logger = new Logger(version);

import * as RegEx from './utils/RegEx'

export function getPrivateAddress(privateAddress: string): string {

    if (typeof(privateAddress) !== "string") {
        logger.throwArgumentError("invalid private address. Not a string", "privateAddress", privateAddress);
    }

    if (privateAddress.match(RegEx.bytes)) {
        // 32 bytes hexadecimal encoded with 0x prefix gives 64 + 2 = 66 characters
        if (privateAddress.length === 66) {
            // convert to hex to string in base64 encoding
            const buf = Buffer.from(privateAddress.substring(2), 'hex')
            return buf.toString('base64');
        }
        else {
            return logger.throwArgumentError(`invalid hexadecimal encoded private address. Length ${privateAddress.length} and not 66`, "privateAddress", privateAddress);
        }
    }

    // strip 0x prefix
    if (privateAddress.substring(0, 2) === '0x') {
        privateAddress = privateAddress.substring(2)
    }

    // If base64 encoded
    if (privateAddress.match(RegEx.base64)) {
        if (privateAddress.length === 44) {
            return privateAddress;
        }
        else {
            return logger.throwArgumentError(`invalid base64 encoded private address. Length ${privateAddress.length} and not 44`, "privateAddress", privateAddress);
        }

    }

    return logger.throwArgumentError("invalid private address. No hexadecimal or base64 encoded", "privateAddress", privateAddress);
}
