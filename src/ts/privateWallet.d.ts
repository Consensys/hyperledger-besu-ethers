import { Signer } from "@ethersproject/abstract-signer";
import { Wallet } from '@ethersproject/wallet';
import { PrivateTransactionRequest, PrivateTransactionResponse } from './privateTransaction';
import { PrivateProvider } from './privateProvider';
export interface PrivateSigner extends Signer {
    readonly provider: PrivateProvider;
    privateCall(transaction: PrivateTransactionRequest): Promise<string>;
    signPrivateTransaction(transaction: PrivateTransactionRequest): Promise<string>;
    sendPrivateTransaction(transaction: PrivateTransactionRequest): Promise<PrivateTransactionResponse>;
}
export declare class PrivateWallet extends Wallet implements PrivateSigner {
    readonly provider: PrivateProvider;
    privateCall(transaction: PrivateTransactionRequest): Promise<string>;
    signPrivateTransaction(transaction: PrivateTransactionRequest): Promise<string>;
    sendPrivateTransaction(transaction: PrivateTransactionRequest): Promise<PrivateTransactionResponse>;
    populatePrivateTransaction(transaction: PrivateTransactionRequest): Promise<PrivateTransactionRequest>;
    checkTransaction(transaction: PrivateTransactionRequest): PrivateTransactionRequest;
}
