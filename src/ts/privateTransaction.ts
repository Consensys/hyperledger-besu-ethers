
import { Log } from '@ethersproject/abstract-provider'
import { getAddress } from "@ethersproject/address"
import { BigNumber, BigNumberish } from "@ethersproject/bignumber"
import {
    BytesLike,
    hexDataSlice,
    hexZeroPad,
    SignatureLike,
    splitSignature,
    stripZeros
} from '@ethersproject/bytes'
import { Zero } from "@ethersproject/constants"
import { checkProperties } from "@ethersproject/properties"
import { keccak256 } from "@ethersproject/keccak256"
import { computePublicKey, recoverPublicKey } from "@ethersproject/signing-key"
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";

const logger = new Logger(version);

import { getPrivateAddress } from './privateAddress'
import { arrayify, hexlify } from './bytes'
import * as RLP from "./rlp"

function handleAddress(value: string): string {
    if (value === "0x") { return null; }
    return getAddress(value);
}

function handleNumber(value: string): BigNumber {
    if (value === "0x") { return Zero; }
    return BigNumber.from(value);
}

function handlePrivateAddress(value: string): string {
    if (value === "0x") { return value }
    return getPrivateAddress(value);
}

function handlePrivateFor(privateFor: string | string[]): string | string[] {

    if (Array.isArray(privateFor)) {

        let result: string[] = []

        privateFor.forEach(address => {
            result.push(handlePrivateAddress(address))
        })

        return result
    }
    else {
        // privateFor must contain privacyGroupId
        return handlePrivateAddress(privateFor)
    }
}

// converts hexadecimal encoded string back into a string
function handleString(value: string): string {
    // strip the 0x prefix before converting hex string to a Buffer
    const stringBuf = Buffer.from(value.substring(2), 'hex')
    // convert Buffer to a utf8 string
    return stringBuf.toString()
}

const transactionFields = [
    { name: 'nonce',    maxLength: 32 },
    { name: 'gasPrice', maxLength: 32 },
    { name: 'gasLimit', maxLength: 32 },
    { name: 'to',          length: 20 },
    { name: 'value',    maxLength: 32 },
    { name: 'data' },

    { name: 'chainId'},

    // Extra EEA privacy properties
    { name: 'privateFrom'},
    { name: 'privateFor'},
    { name: 'restriction'},
]

export const allowedTransactionKeys: { [ key: string ]: boolean } = {
    chainId: true, data: true, gasLimit: true, gasPrice:true, nonce: true, to: true, value: true,
    // EEA fields
    privateFrom: true, privateFor: true, restriction: true
}

export function computeAddress(key: BytesLike | string): string {
    let publicKey = computePublicKey(key);
    return getAddress(hexDataSlice(keccak256(hexDataSlice(publicKey, 1)), 12));
}

export function recoverAddress(digest: BytesLike, signature: SignatureLike): string {
    return computeAddress(recoverPublicKey(arrayify(digest), signature));
}

export type Restriction = 'restricted' | 'unrestricted'

export type PrivateUnsignedTransaction = {
    to?: string;
    nonce?: number;

    gasLimit?: BigNumberish;
    gasPrice?: BigNumberish;

    data?: BytesLike;
    value?: BigNumberish;
    chainId?: number;

    // Extra EEA privacy properties
    privateFrom?: string;
    privateFor?: string | string[];
    restriction?: Restriction;
}

export interface PrivateTransaction {
    publicHash?: string;
    privateHash?: string;

    to?: string;
    from?: string;
    nonce: number;

    gasLimit: BigNumber;
    gasPrice: BigNumber;

    data: string;
    value: BigNumber;
    chainId: number;

    // Extra EEA privacy properties
    privateFrom?: string;
    privateFor: string | string[];
    restriction?: Restriction;

    r?: string;
    s?: string;
    v?: number;
}

export interface PrivateTransactionRequest {
    to?: string | Promise<string>
    from?: string | Promise<string>
    nonce?: BigNumberish | Promise<BigNumberish>
    gasLimit?: BigNumberish | Promise<BigNumberish>
    gasPrice?: BigNumberish | Promise<BigNumberish>
    data?: BytesLike | Promise<BytesLike>
    value?: BigNumberish | Promise<BigNumberish>
    chainId?: number | Promise<number>

    // Extra EEA privacy properties
    privateFrom?: string
    privateFor: string | string[]
    restriction: Restriction
};

export interface PrivateTransactionReceipt {
    to?: string;
    from?: string;
    contractAddress?: string;
    logs?: Array<Log>;
    output?: string;

    blockNumber?: number;
    confirmations?: number,
}

export interface PrivateTransactionResponse extends PrivateTransaction {
    blockNumber?: number;
    blockHash?: string;
    timestamp?: number;
    confirmations: number;
    from: string;
    raw?: string;
    wait: (confirmations?: number) => Promise<PrivateTransactionReceipt>;
}

export function serialize(transaction: PrivateUnsignedTransaction, signature?: SignatureLike): string {
    checkProperties(transaction, allowedTransactionKeys);

    let raw: Array<string | Uint8Array | string[]> = [];

    transactionFields.forEach(fieldInfo => {
        let value = (<any>transaction)[fieldInfo.name] || ([]);

        if (fieldInfo.name === 'restriction' && !transaction.restriction) {
            value = 'restricted';
        }

        if (fieldInfo.name === 'privateFor') {
            if (Array.isArray(value)) {
                // Convert items of the array to bytes
                value = value.map((v: any) => {
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
            } else {
                value = Buffer.from(value, 'base64');
            }
        }
        else {
            value = arrayify(hexlify(value));
        }

        // Fixed-width field
        if (fieldInfo.length && value.length !== fieldInfo.length && value.length > 0) {
            logger.throwArgumentError("invalid length for " + fieldInfo.name, ("transaction:" + fieldInfo.name), value);
        }

        // Variable-width (with a maximum)
        if (fieldInfo.maxLength) {
            value = stripZeros(value);
            if (value.length > fieldInfo.maxLength) {
                logger.throwArgumentError("invalid length for " + fieldInfo.name, ("transaction:" + fieldInfo.name), value );
            }
        }

        if (fieldInfo.name === 'chainId') {
            if (transaction.chainId != null && transaction.chainId !== 0) {
                raw.push(hexlify(value));    // v
            }
            else {
                raw.push("0x");     // v
            }
            raw.push("0x");     // r
            raw.push("0x");     // s
        }
        else {
            raw.push(hexlify(value));
        }
    });

    let unsignedTransaction = RLP.encode(raw);

    // Requesting an unsigned transaction
    if (!signature) {
        return unsignedTransaction;
    }

    // The splitSignature will ensure the transaction has a recoveryParam in the
    // case that the signTransaction function only adds a v.
    let sig = splitSignature(signature);

    let v = 27 + sig.recoveryParam
    v += transaction.chainId * 2 + 8;

    raw[6] = hexlify(v);
    raw[7] = stripZeros(arrayify(sig.r));
    raw[8] = stripZeros(arrayify(sig.s));

    return RLP.encode(raw);
}

export function parse(rawTransaction: BytesLike): PrivateTransaction {
    let transaction = RLP.decode(rawTransaction);
    if (transaction.length !== 12) {
        logger.throwArgumentError(`invalid raw transaction. Has ${transaction.length} fields, expecting ${12}`, "rawTransaction", rawTransaction);
    }

    let tx: PrivateTransaction = {
        nonce:    handleNumber(transaction[0]).toNumber(),
        gasPrice: handleNumber(transaction[1]),
        gasLimit: handleNumber(transaction[2]),
        to:       handleAddress(transaction[3]),
        value:    handleNumber(transaction[4]),
        data:     transaction[5],
        chainId:  0,
        privateFrom: handlePrivateAddress(transaction[9]),
        privateFor: handlePrivateFor(transaction[10]),
        // @ts-ignore parse value may not be restricted or unrestricted
        restriction: handleString(transaction[11]),
    };

    try {
        tx.v = BigNumber.from(transaction[6]).toNumber();
    } catch (error) {
        console.log(error);
        return tx;
    }

    tx.r = hexZeroPad(transaction[7], 32);
    tx.s = hexZeroPad(transaction[8], 32);

    if (BigNumber.from(tx.r).isZero() && BigNumber.from(tx.s).isZero()) {
        // EIP-155 unsigned transaction
        tx.chainId = tx.v;
        tx.v = 0;

    } else {
        // Signed Transaction

        tx.chainId = Math.floor((tx.v - 35) / 2);
        if (tx.chainId < 0) { tx.chainId = 0; }

        let recoveryParam = tx.v - 27;

        if (tx.chainId !== 0) {
            transaction[6] = hexlify(tx.chainId);
            transaction[7] =  "0x";
            transaction[8] =  "0x";
            recoveryParam -= tx.chainId * 2 + 8;
        }

        let digest = keccak256(RLP.encode(transaction));
        try {
            tx.from = recoverAddress(digest, { r: hexlify(tx.r), s: hexlify(tx.s), recoveryParam: recoveryParam });
        } catch (error) {
            console.log(error);
        }

        tx.privateHash = keccak256(rawTransaction);
    }

    return tx;
}
