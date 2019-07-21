"use strict";

import { Formatter } from "@ethersproject/providers";

import { parse as parseTransaction, EeaTransactionReceipt } from "./eeaTransaction";

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
    // Add extra EEA format for private transaction receipts
    privateReceipt: FormatFuncs,
};

// Override the formatting of the transaction as it now includes the new EEA
export class EeaFormatter extends Formatter {

    readonly formats: EeaFormats;

    getDefaultFormats(): EeaFormats {

        const address = this.address.bind(this);
        const data = this.data.bind(this);

        const superFormats = super.getDefaultFormats()

        // Override default formats with EeaFormat
        return {
            ...superFormats,

            // Format of API response of eea_getTransactionReceipt
            // which is called in EeaJsonRpcProvider.getPrivateTransactionReceipt
            privateReceipt: {
                to: Formatter.allowNull(this.address),
                from: Formatter.allowNull(this.address),
                contractAddress: Formatter.allowNull(address, null),
                logs: Formatter.arrayOf(this.receiptLog.bind(this)),
                output: Formatter.allowNull(data)
            }
        }
    }

    transaction(value: any): any {
        return parseTransaction(value);
    }

    privateReceipt(value: any): EeaTransactionReceipt {
        return Formatter.check(this.formats.privateReceipt, value);
    }
}
