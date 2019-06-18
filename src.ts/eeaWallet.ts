import { Wallet } from 'ethers'

import { getAddress } from "@ethersproject/address"
import { TransactionRequest } from "@ethersproject/abstract-provider"
import { keccak256 } from "@ethersproject/keccak256"
import { resolveProperties } from "@ethersproject/properties"

import { serialize } from './transactions'

export class EEA_Wallet extends Wallet {

    signTransaction(transaction: TransactionRequest): Promise<string> {
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
