import { Wallet } from '@ethersproject/wallet';
import { BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";
import { PrivateTransactionReceipt, PrivateTransactionResponse } from './privateTransaction';
import { PrivateJsonRpcProvider } from './privateProvider';
import { PrivacyGroupOptions } from './privacyGroup';
export interface PrivateTransactionRequest {
    to?: string | Promise<string>;
    from?: string | Promise<string>;
    nonce?: BigNumberish | Promise<BigNumberish>;
    gasLimit?: BigNumberish | Promise<BigNumberish>;
    gasPrice?: BigNumberish | Promise<BigNumberish>;
    data?: BytesLike | Promise<BytesLike>;
    value?: BigNumberish | Promise<BigNumberish>;
    chainId?: number | Promise<number>;
    privateFrom?: string;
    privateFor?: string | string[];
    restriction?: string;
}
export declare class PrivateWallet extends Wallet {
    readonly provider: PrivateJsonRpcProvider;
    privateCall(transaction: PrivateTransactionRequest): Promise<string>;
    signPrivateTransaction(transaction: PrivateTransactionRequest): Promise<string>;
    sendPrivateTransaction(transaction: PrivateTransactionRequest): Promise<PrivateTransactionResponse>;
    populatePrivateTransaction(transaction: PrivateTransactionRequest): Promise<PrivateTransactionRequest>;
    getPrivateTransactionCount(privacyGroupOptions: PrivacyGroupOptions): Promise<number>;
    getPrivateTransaction(publicTransactionHash: string): Promise<PrivateTransactionResponse>;
    getPrivateTransactionReceipt(publicTransactionHash: string): Promise<PrivateTransactionReceipt>;
    checkTransaction(transaction: PrivateTransactionRequest): PrivateTransactionRequest;
}
