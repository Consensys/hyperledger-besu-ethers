import { Wallet } from 'ethers'

import { getAddress } from "@ethersproject/address"
import { keccak256 } from "@ethersproject/keccak256"
import { resolveProperties } from "@ethersproject/properties"
import { BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";

import { serialize } from './eeaTransaction'

export interface EeaTransactionRequest {
    to?: string | Promise<string>
    from?: string | Promise<string>
    nonce?: BigNumberish | Promise<BigNumberish>
    gasLimit?: BigNumberish | Promise<BigNumberish>
    gasPrice?: BigNumberish | Promise<BigNumberish>
    data?: BytesLike | Promise<BytesLike>
    value?: BigNumberish | Promise<BigNumberish>
    chainId?: number | Promise<number>

    // Extra EEA privacy properties
    privateFrom: string
    privateFor: string[]
    restriction?: string
};


export class EeaWallet extends Wallet {

    signTransaction(transaction: EeaTransactionRequest): Promise<string> {
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
}
