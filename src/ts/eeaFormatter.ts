'use strict'

import { Formatter } from '@ethersproject/providers'
import * as errors from '@ethersproject/errors'

import { parse as parseTransaction, EeaTransactionResponse, EeaTransactionReceipt } from './eeaTransaction'
import * as RegEx from './utils/RegEx'

// Copied from the Formatter declaration in @ethersproject/providers
export type FormatFunc = (value: any) => any;
export type FormatFuncs = { [ key: string ]: FormatFunc };

export type EeaFormats = {
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
export class EeaFormatter extends Formatter {

    readonly formats: EeaFormats

    getDefaultFormats(): EeaFormats {

        const superFormats = super.getDefaultFormats();

        // Override default formats with EeaFormat
        return {
            ...superFormats,

            // Format of API response of eea_getTransactionReceipt
            // which is called in EeaJsonRpcProvider.getPrivateTransactionReceipt
            privateReceipt: {
                to: Formatter.allowNull(this.address),
                from: Formatter.allowNull(this.address),
                contractAddress: Formatter.allowNull(this.address.bind(this), null),
                logs: Formatter.arrayOf(this.receiptLog.bind(this)),
                output: Formatter.allowNull(this.data.bind(this))
            },

            privateTransaction: {
                ...superFormats.transaction,
                // Add extra EEA fields
                privateFrom: Formatter.allowNull(this.privateAddress),
                privateFor: Formatter.allowNull(this.privateFor.bind(this)),
                restriction: Formatter.allowNull(this.restriction),
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

        throw errors.makeError('invalid private address. Has to be base64 encoded string of 44 characters.', 'privateAddress', privateAddress);
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
            throw errors.makeError('invalid privateFor. Has to be base64 encoded string or an array of base64 encoded strings.', 'privateFor', privateFor);
        }
    }

    restriction(restriction?: string): string | null {
        if (!restriction) { return null }
        if (restriction === 'restricted' || restriction === 'unrestricted') {
            return restriction;
        }

        throw errors.makeError('invalid restriction. Must be either \'restricted\' or \'unrestricted\'.', 'InvalidRestriction', { restriction });
    }

    transaction(value: any): any {
        return parseTransaction(value);
    }

    privateReceipt(value: any): EeaTransactionReceipt {
        return Formatter.check(this.formats.privateReceipt, value);
    }

    privateTransactionResponse(transaction: any): EeaTransactionResponse {

        // Rename input to data
        if (transaction.input != null && transaction.data == null) {
            transaction.data = transaction.input;
        }

        // Rename gas to gasLimit
        if (transaction.gas != null && transaction.gasLimit == null) {
            transaction.gasLimit = transaction.gas;
        }

        let result = Formatter.check(this.formats.privateTransaction, transaction);

        return result;
    }
}
