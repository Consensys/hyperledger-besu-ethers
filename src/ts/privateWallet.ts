
import { getAddress } from "@ethersproject/address"
import { keccak256 } from "@ethersproject/keccak256"
import { resolveProperties, shallowCopy } from "@ethersproject/properties"
import { Signer } from "@ethersproject/abstract-signer";
import { Logger } from "@ethersproject/logger";
import { Wallet } from '@ethersproject/wallet'
import { version } from "./_version";

const logger = new Logger(version);

import { PrivateTransactionRequest, PrivateTransactionResponse, serialize} from './privateTransaction'
import { PrivateProvider } from './privateProvider'

const allowedPrivateTransactionKeys: Array<string> = [
    "chainId", "data", "from", "gasLimit", "gasPrice", "nonce", "to", "value",
    // EEA keys
    "privateFrom", "privateFor", "restriction",
];

export interface PrivateSigner extends Signer {
    readonly provider: PrivateProvider;
    privateCall(transaction: PrivateTransactionRequest): Promise<string>;
    signPrivateTransaction(transaction: PrivateTransactionRequest): Promise<string>;
    sendPrivateTransaction(transaction: PrivateTransactionRequest): Promise<PrivateTransactionResponse>;
}

export class PrivateWallet extends Wallet implements PrivateSigner {

    readonly provider: PrivateProvider;

    privateCall(
        transaction: PrivateTransactionRequest,
    ): Promise<string> {
        return this.sendPrivateTransaction(transaction)
            .then(response => {
                // Wait for the transaction to be mined and the receipt returned
                return response.wait()
            })
            .then(receipt => {
                return receipt.output
            })
    }

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
            if (tx.nonce == null) { tx.nonce = this.provider.getPrivateTransactionCount(this.getAddress(), transaction); }

            // Make sure any provided address matches this signer
            if (tx.from == null) {
                tx.from = this.getAddress();
            } else {
                tx.from = Promise.all([
                    this.getAddress(),
                    this.provider.resolveName(tx.from)
                ]).then((results) => {
                    if (results[0] !== results[1]) {
                        logger.throwArgumentError("from address mismatch", "transaction", transaction);
                    }
                    return results[0];
                });
            }

            if (tx.gasLimit == null) {
                // FIXME can't estimate gas until Besu implements eea_estimateGas
                // eth_estimateGas can not estimate private transactions
                // dirty hack for now is to just set the gasLimit to something large
                tx.gasLimit = 10000000
                // tx.gasLimit = this.estimateGas(tx);
            }
            if (tx.chainId == null) { tx.chainId = this.getChainId(); }

            return resolveProperties(tx);
        });
    }

    checkTransaction(transaction: PrivateTransactionRequest): PrivateTransactionRequest {
        for (let key in transaction) {
            if (allowedPrivateTransactionKeys.indexOf(key) === -1) {
                logger.throwArgumentError("invalid transaction key: " + key, "transaction", transaction);
            }
        }

        let tx = shallowCopy(transaction);
        if (tx.from == null) { tx.from = this.getAddress(); }
        return tx;
    }
}
