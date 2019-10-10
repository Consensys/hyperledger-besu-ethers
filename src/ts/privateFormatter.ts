'use strict'

import { Formatter } from '@ethersproject/providers';
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";

const logger = new Logger(version);

import { parse as parseTransaction, PrivateTransactionResponse, PrivateTransactionReceipt } from './privateTransaction'
import * as RegEx from './utils/RegEx'

// Copied from the Formatter declaration in @ethersproject/providers
export type FormatFunc = (value: any) => any;
export type FormatFuncs = { [ key: string ]: FormatFunc };

export type PrivateFormats = {
    transaction: FormatFuncs,
    transactionRequest: FormatFuncs,
    receipt: FormatFuncs,
    receiptLog: FormatFuncs,
    block: FormatFuncs,
    blockWithTransactions: FormatFuncs,
    filter: FormatFuncs,
    filterLog: FormatFuncs,
    // Add extra EEA formats
    privateReceipt: FormatFuncs,
    privateTransaction: FormatFuncs,
};

// Override the formatting of the transaction as it now includes the new EEA
export class PrivateFormatter extends Formatter {

    readonly formats: PrivateFormats

    getDefaultFormats(): PrivateFormats {

        const superFormats = super.getDefaultFormats();

        // Override default formats with EeaFormat
        return {
            ...superFormats,

            // Format of API response of priv_getTransactionReceipt
            // which is called in PrivateJsonRpcProvider.getPrivateTransactionReceipt
            privateReceipt: {
                to: Formatter.allowNull(this.address, null),
                from: Formatter.allowNull(this.address, null),
                contractAddress: Formatter.allowNull(this.address.bind(this), null),
                logs: Formatter.arrayOf(this.receiptLog.bind(this)),
                output: Formatter.allowNull(this.data.bind(this)),

                blockNumber: Formatter.allowNull(this.number, null),
                confirmations: Formatter.allowNull(this.number, null),
            },

            privateTransaction: {
                ...superFormats.transaction,
                publicHash: Formatter.allowNull(null, null),
                privateHash: this.hash.bind(this),
                // Add extra EEA fields
                privateFrom: Formatter.allowNull(this.privateAddress, null),
                privateFor: this.privateFor.bind(this),
                restriction: this.restriction,
            }
        }
    }

    privateAddress(privateAddress?: string): string | null {
        if (!privateAddress) { return null }

        if (typeof privateAddress === 'string' &&
            privateAddress.match(RegEx.base64) &&
            privateAddress.length === 44) {

            return privateAddress;
        }

        throw logger.makeError('invalid private address. Has to be base64 encoded string of 44 characters.', 'privateAddress', privateAddress);
    }

    privateFor(privateFor: any): string[] | string | null {
        if (!privateFor) { return null }

        try {
            if (Array.isArray(privateFor)) {
                for (const privAddress of privateFor) {
                    this.privateAddress(privAddress);
                }

                return privateFor;
            }

            return this.privateAddress(privateFor);
        }
        catch (err) {
            throw logger.makeError('invalid privateFor. Has to be base64 encoded string or an array of base64 encoded strings.', 'privateFor', privateFor);
        }
    }

    restriction(restriction?: string): string | null {
        if (!restriction) { return null }
        if (restriction === 'restricted' || restriction === 'unrestricted') {
            return restriction;
        }

        throw logger.makeError('invalid restriction. Must be either \'restricted\' or \'unrestricted\'.', 'InvalidRestriction', { restriction });
    }

    transaction(value: any): any {
        return parseTransaction(value);
    }

    privateReceipt(value: any): PrivateTransactionReceipt {
        return Formatter.check(this.formats.privateReceipt, value);
    }

    privateTransactionResponse(transaction: any): PrivateTransactionResponse {

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
            transaction.privateHash = transaction.hash
        }

        // we don't have enough information to set the hash of the public market transaction
        transaction.publicHash = null

        let result = Formatter.check(this.formats.privateTransaction, transaction);

        return result;
    }
}
