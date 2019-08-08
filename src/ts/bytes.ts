
import { BytesLike, Hexable, DataOptions, isBytes, isHexString } from '@ethersproject/bytes';
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";

const logger = new Logger(version);

// the following two functions are not currently exported from @ethersproject/bytes
// so need to declare here
function isHexable(value: any): value is Hexable {
    return !!(value.toHexString);
}

function addSlice(array: Uint8Array): Uint8Array {
    if (array.slice) { return array; }

    array.slice = function() {
        let args = Array.prototype.slice.call(arguments);
        return addSlice(new Uint8Array(Array.prototype.slice.apply(array, args)));
    }

    return array;
}

export function arrayify(value: BytesLike | Hexable | number | string, options?: DataOptions): Uint8Array {
    if (!options) { options = { }; }

    if (typeof(value) === "number") {
        logger.checkSafeUint53(value, "invalid arrayify value");

        let result = [];
        while (value) {
            result.unshift(value & 0xff);
            value /= 256;
        }
        if (result.length === 0) { result.push(0); }

        return addSlice(new Uint8Array(result));
    }

    if (options.allowMissingPrefix && typeof(value) === "string" && value.substring(0, 2) !== "0x") {
        value = "0x" + value;
    }

    if (isHexable(value)) { value = value.toHexString(); }

    if (isHexString(value)) {
        let hex = (<string>value).substring(2);
        if (!options.allowOddLength && hex.length % 2) {
            logger.throwArgumentError("hex data is odd-length", "value", value);
        }

        let result = [];
        for (let i = 0; i < hex.length; i += 2) {
            result.push(parseInt(hex.substring(i, i + 2), 16));
        }

        return addSlice(new Uint8Array(result));
    }

    // The transaction option restriction is a string so need to handle
    if (typeof(value) === 'string') {
        const result = Buffer.from(value)
        return addSlice(new Uint8Array(result));
    }

    if (isBytes(value)) {
        return addSlice(new Uint8Array(value));
    }

    return logger.throwArgumentError("invalid arrayify value", "value", value);
}

const HexCharacters: string = "0123456789abcdef";

export function hexlify(value: BytesLike | Hexable | number | string,
                        options?: DataOptions): string
{
    if (!options) { options = { }; }

    if (typeof(value) === "number") {
        logger.checkSafeUint53(value, "invalid hexlify value");

        let hex = "";
        while (value) {
            hex = HexCharacters[value & 0x0f] + hex;
            value = Math.floor(value / 16);
        }

        if (hex.length) {
            if (hex.length % 2) { hex = "0" + hex; }
            return "0x" + hex;
        }

        return "0x00";
    }

    if (options.allowMissingPrefix && typeof(value) === "string" && value.substring(0, 2) !== "0x") {
        value = "0x" + value;
    }

    if (isHexable(value)) { return value.toHexString(); }

    if (isHexString(value)) {
        if (!options.allowOddLength && (<string>value).length % 2) {
            logger.throwArgumentError("hex data is odd-length", "value", value);
        }
        return (<string>value).toLowerCase();
    }

    // The transaction option restriction is a string so need to handle
    if (typeof(value) === 'string') {
        // Convert to bytes so it can be converted to hex by the bytes conversion
        value = Buffer.from(value);
    }

    if (isBytes(value)) {
        let result = "0x";
        for (let i = 0; i < value.length; i++) {
            let v = value[i];
            result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
        }
        return result;
    }

    return logger.throwArgumentError("invalid hexlify value", "value", value);
}
