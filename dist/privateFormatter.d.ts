import { Formatter } from '@ethersproject/providers';
import { PrivateTransactionResponse, PrivateTransactionReceipt } from './privateTransaction';
export declare type FormatFunc = (value: any) => any;
export declare type FormatFuncs = {
    [key: string]: FormatFunc;
};
export declare type PrivateFormats = {
    transaction: FormatFuncs;
    transactionRequest: FormatFuncs;
    receipt: FormatFuncs;
    receiptLog: FormatFuncs;
    block: FormatFuncs;
    blockWithTransactions: FormatFuncs;
    filter: FormatFuncs;
    filterLog: FormatFuncs;
    privateReceipt: FormatFuncs;
    privateTransaction: FormatFuncs;
};
export declare class PrivateFormatter extends Formatter {
    readonly formats: PrivateFormats;
    getDefaultFormats(): PrivateFormats;
    privateAddress(privateAddress?: string): string | null;
    privateFor(privateFor: any): string[] | string | null;
    restriction(restriction?: string): string | null;
    transaction(value: any): any;
    privateReceipt(value: any): PrivateTransactionReceipt;
    privateTransactionResponse(transaction: any): PrivateTransactionResponse;
}
