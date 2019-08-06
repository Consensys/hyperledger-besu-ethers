import { Log } from '@ethersproject/abstract-provider';
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { BytesLike, SignatureLike } from '@ethersproject/bytes';
export declare const allowedTransactionKeys: {
    [key: string]: boolean;
};
export declare function computeAddress(key: BytesLike | string): string;
export declare function recoverAddress(digest: BytesLike, signature: SignatureLike): string;
export declare type PrivateUnsignedTransaction = {
    to?: string;
    nonce?: number;
    gasLimit?: BigNumberish;
    gasPrice?: BigNumberish;
    data?: BytesLike;
    value?: BigNumberish;
    chainId?: number;
    privateFrom?: string;
    privateFor?: string | string[];
    restriction?: string;
};
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
    privateFrom: string;
    privateFor: string | string[];
    restriction?: string;
    r?: string;
    s?: string;
    v?: number;
}
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
    privateFor: string | string[];
    restriction: 'restricted' | 'unrestricted';
}
export interface PrivateTransactionReceipt {
    to?: string;
    from?: string;
    contractAddress?: string;
    logs?: Array<Log>;
    output?: string;
    blockNumber?: number;
    confirmations?: number;
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
export declare function serialize(transaction: PrivateUnsignedTransaction, signature?: SignatureLike): string;
export declare function parse(rawTransaction: BytesLike): PrivateTransaction;
