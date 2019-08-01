
import { getAddress } from "@ethersproject/address"
import { keccak256 } from "@ethersproject/keccak256"
import * as errors from "@ethersproject/errors";
import { resolveProperties, shallowCopy } from "@ethersproject/properties"
import { Wallet } from '@ethersproject/wallet'

// Import types
import { BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";

import { PrivateTransactionResponse, serialize } from './privateTransaction'
import { PrivateJsonRpcProvider } from './privateProvider'
import {PrivacyGroupOptions} from './privacyGroup'

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
    privateFor?: string | string[]
    restriction?: string
};

const allowedPrivateTransactionKeys: Array<string> = [
    "chainId", "data", "from", "gasLimit", "gasPrice", "nonce", "to", "value",
    // EEA keys
    "privateFrom", "privateFor", "restriction",
];

export class PrivateWallet extends Wallet {

    readonly provider: PrivateJsonRpcProvider;

    signPrivateTransaction(transaction: PrivateTransactionRequest): Promise<string> {
        return resolveProperties(transaction).then((tx) => {
            if (tx.from != null) {
                if (getAddress(tx.from) !== this.address) {
                    throw new Error("transaction from address mismatch");
                }
                delete tx.from;
            }

            let signature = this._signingKey().signDigest(keccak256(serialize(tx)));
            return serialize(tx, signature);
        });
    }

    sendPrivateTransaction(transaction: PrivateTransactionRequest): Promise<PrivateTransactionResponse> {
        this._checkProvider("sendTransaction");
        return this.populatePrivateTransaction(transaction).then((tx) => {
            return this.signPrivateTransaction(tx).then((signedTx) => {
                return this.provider.sendPrivateTransaction(signedTx);
            });
        });
    }

    // Populates ALL keys for a transaction and checks that "from" matches
    // this Signer. Should be used by sendTransaction but NOT by signTransaction.
    // By default called from: (overriding these prevents it)
    //   - sendTransaction
    populatePrivateTransaction(transaction: PrivateTransactionRequest): Promise<PrivateTransactionRequest> {
        return resolveProperties(this.checkTransaction(transaction)).then((tx) => {

            if (tx.to != null) { tx.to = Promise.resolve(tx.to).then((to) => this.resolveName(to)); }
            if (tx.gasPrice == null) { tx.gasPrice = this.getGasPrice(); }
            if (tx.nonce == null) { tx.nonce = this.getPrivateTransactionCount(transaction); }

            // Make sure any provided address matches this signer
            if (tx.from == null) {
                tx.from = this.getAddress();
            } else {
                tx.from = Promise.all([
                    this.getAddress(),
                    this.provider.resolveName(tx.from)
                ]).then((results) => {
                    if (results[0] !== results[1]) {
                        errors.throwArgumentError("from address mismatch", "transaction", transaction);
                    }
                    return results[0];
                });
            }

            if (tx.gasLimit == null) { tx.gasLimit = this.estimateGas(tx);  }
            if (tx.chainId == null) { tx.chainId = this.getChainId(); }

            return resolveProperties(tx);
        });
    }

    getPrivateTransactionCount(privacyGroupOptions: PrivacyGroupOptions): Promise<number> {
        this._checkProvider("getPrivateTransactionCount");
        return this.provider.getPrivateTransactionCount(this.getAddress(), privacyGroupOptions);
    }

    checkTransaction(transaction: PrivateTransactionRequest): PrivateTransactionRequest {
        for (let key in transaction) {
            if (allowedPrivateTransactionKeys.indexOf(key) === -1) {
                errors.throwArgumentError("invalid transaction key: " + key, "transaction", transaction);
            }
        }

        let tx = shallowCopy(transaction);
        if (tx.from == null) { tx.from = this.getAddress(); }
        return tx;
    }
}
