
import { BytesLike } from "@ethersproject/bytes";

import { arrayify, hexlify } from './bytes'

function arrayifyInteger(value: number): Array<number> {
    let result = [];
    while (value) {
        result.unshift(value & 0xff);
        value >>= 8;
    }
    return result;
}

function unarrayifyInteger(data: Uint8Array, offset: number, length: number): number {
    let result = 0;
    for (let i = 0; i < length; i++) {
        result = (result * 256) + data[offset + i];
    }
    return result;
}

function _encode(object: Array<any> | string | boolean | number): Array<number> {

    if (Array.isArray(object)) {
        let payload: Array<number> = [];
        object.forEach(function(child) {
            payload = payload.concat(_encode(child));
        });

        if (payload.length <= 55) {
            payload.unshift(0xc0 + payload.length)
            return payload;
        }

        let length = arrayifyInteger(payload.length);
        length.unshift(0xf7 + length.length);

        return length.concat(payload);

    }

    // see point 9 of the RLP Encoding
    // https://medium.com/coinmonks/data-structure-in-ethereum-episode-1-recursive-length-prefix-rlp-encoding-decoding-d1016832f919
    if (typeof(object) === 'boolean') {
        if (object) {
            // @ts-ignore
            return [0x01]
        } else {
            // @ts-ignore
            return [0x80]
        }
    }

    if (typeof(object) === "number") {
        object = hexlify(object)
    }

    let data: Array<number> = Array.prototype.slice.call(arrayify(object));

    if (data.length === 1 && data[0] <= 0x7f) {
        return data;

    } else if (data.length <= 55) {
        data.unshift(0x80 + data.length);
        return data;
    }

    let length = arrayifyInteger(data.length);
    length.unshift(0xb7 + length.length);

    return length.concat(data);
}

export function encode(object: any): string {
    const rlpEncoded = _encode(object)
    return hexlify(rlpEncoded);
}

type Decoded = {
    result: any;
    consumed: number;
};

function _decodeChildren(data: Uint8Array, offset: number, childOffset: number, length: number): Decoded {
    let result = [];

    while (childOffset < offset + 1 + length) {
        let decoded = _decode(data, childOffset);

        result.push(decoded.result);

        childOffset += decoded.consumed;
        if (childOffset > offset + 1 + length) {
            throw new Error("invalid rlp");
        }
    }

    return {consumed: (1 + length), result: result};
}

// Returns { consumed: number, result: (string|string[])[] }
function _decode(data: Uint8Array, offset: number): { consumed: number, result: Object } {
    if (data.length === 0) { throw new Error("invalid rlp data"); }

    // Array with extra length prefix
    if (data[offset] >= 0xf8) {
        let lengthLength = data[offset] - 0xf7;
        if (offset + 1 + lengthLength > data.length) {
            throw new Error("too short");
        }

        let length = unarrayifyInteger(data, offset + 1, lengthLength);
        if (offset + 1 + lengthLength + length > data.length) {
            throw new Error("to short");
        }

        return _decodeChildren(data, offset, offset + 1 + lengthLength, lengthLength + length);

    } else if (data[offset] >= 0xc0) {
        let length = data[offset] - 0xc0;
        if (offset + 1 + length > data.length) {
            throw new Error("invalid rlp data");
        }

        return _decodeChildren(data, offset, offset + 1, length);

    } else if (data[offset] >= 0xb8) {
        let lengthLength = data[offset] - 0xb7;
        if (offset + 1 + lengthLength > data.length) {
            throw new Error("invalid rlp data");
        }

        let length = unarrayifyInteger(data, offset + 1, lengthLength);
        if (offset + 1 + lengthLength + length > data.length) {
            throw new Error("invalid rlp data");
        }

        let result = hexlify(data.slice(offset + 1 + lengthLength, offset + 1 + lengthLength + length));
        return { consumed: (1 + lengthLength + length), result: result }

    } else if (data[offset] >= 0x80) {
        let length = data[offset] - 0x80;
        if (offset + 1 + length > data.length) {
            throw new Error("invlaid rlp data");
        }

        let result = hexlify(data.slice(offset + 1, offset + 1 + length));
        return { consumed: (1 + length), result: result }
    }
    return { consumed: 1, result: hexlify(data[offset]) };
}

// Returns (string|string[])[]
export function decode(data: BytesLike): any {
    let bytes = arrayify(data);
    let decoded = _decode(bytes, 0);
    if (decoded.consumed !== bytes.length) {
        throw new Error("invalid rlp data");
    }
    return decoded.result;
}

