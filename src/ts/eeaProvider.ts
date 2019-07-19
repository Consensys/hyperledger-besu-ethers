
import { TransactionReceipt, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { hexDataLength, hexValue } from "@ethersproject/bytes";
import { hexlify } from "./bytes";
import * as errors from "@ethersproject/errors";
import { Networkish } from "@ethersproject/networks";
import { checkProperties, resolveProperties, shallowCopy } from "@ethersproject/properties";
import { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers";
import { ConnectionInfo, fetchJson, poll } from "@ethersproject/web";

import { EeaFormatter } from './eeaFormatter'
import { PrivacyGroupOptions, generatePrivacyGroup } from './privacyGroup'
import { EeaTransaction } from './eeaTransaction'

const allowedTransactionKeys: { [ key: string ]: boolean } = {
    chainId: true, data: true, gasLimit: true, gasPrice:true, nonce: true, to: true, value: true,
    privateFrom: true, privateFor: true, restricted: true,
}

export class EeaJsonRpcSigner extends JsonRpcSigner {

    sendUncheckedTransaction(transaction: TransactionRequest): Promise<string> {
        transaction = shallowCopy(transaction);

        let fromAddress = this.getAddress().then((address) => {
            if (address) { address = address.toLowerCase(); }
            return address;
        });

        // The JSON-RPC for eth_sendTransaction uses 90000 gas; if the user
        // wishes to use this, it is easy to specify explicitly, otherwise
        // we look it up for them.
        if (transaction.gasLimit == null) {
            let estimate = shallowCopy(transaction);
            estimate.from = fromAddress;
            transaction.gasLimit = this.provider.estimateGas(estimate);
        }

        return Promise.all([
            resolveProperties(transaction),
            fromAddress
        ]).then((results) => {
            let tx = results[0];
            let hexTx = (<any>this.provider.constructor).hexlifyTransaction(tx);
            hexTx.from = results[1];

            // method overridden to use EEA send transaction
            return this.provider.send("eea_sendTransaction", [ hexTx ]).then((hash) => {
                return hash;
            }, (error) => {
                if (error.responseText) {
                    // See: JsonRpcProvider.sendTransaction (@TODO: Expose a ._throwError??)
                    if (error.responseText.indexOf("insufficient funds") >= 0) {
                        errors.throwError("insufficient funds", errors.INSUFFICIENT_FUNDS, {
                            transaction: tx
                        });
                    }
                    if (error.responseText.indexOf("nonce too low") >= 0) {
                        errors.throwError("nonce has already been used", errors.NONCE_EXPIRED, {
                            transaction: tx
                        });
                    }
                    if (error.responseText.indexOf("replacement transaction underpriced") >= 0) {
                        errors.throwError("replacement fee too low", errors.REPLACEMENT_UNDERPRICED, {
                            transaction: tx
                        });
                    }
                }
                throw error;
            });
        });
    }
}


function getResult(payload: { error?: { code?: number, data?: any, message?: string }, result?: any }): any {
    if (payload.error) {
        // @TODO: not any
        let error: any = new Error(payload.error.message);
        error.code = payload.error.code;
        error.data = payload.error.data;
        throw error;
    }

    return payload.result;
}

function getLowerCase(value: string): string {
    if (value) { return value.toLowerCase(); }
    return value;
}

let defaultFormatter: EeaFormatter = null;

export class EeaJsonRpcProvider extends JsonRpcProvider {

    formatter: EeaFormatter;

    constructor(url?: ConnectionInfo | string, network?: Networkish) {

        super(url, network);

        this.formatter = new.target.getFormatter();
    }

    static getFormatter(): EeaFormatter {
        if (defaultFormatter == null) {
            defaultFormatter = new EeaFormatter();
        }
        return defaultFormatter;
    }

    send(method: string, params: any): Promise<any> {
        const id = this._nextId++
        let request = {
            method: method,
            params: params,
            id,
            jsonrpc: "2.0"
        };

        try {
            return fetchJson(this.connection, JSON.stringify(request), getResult).then((result) => {
                this.emit("debug", {
                    action: "send",
                    request: request,
                    response: result,
                    provider: this
                });
                return result;
            });
        }
        catch(err) {
            return errors.throwError(`Failed to send ${method} with params ${JSON.stringify(params)} and id ${id}.`, err.code, {
                method, params, error: err,
            });
        }
    }

    sendPrivateTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse> {
        return this._runPerform("sendPrivateTransaction", {
            signedTransaction: () => Promise.resolve(signedTransaction).then(t => hexlify(t))
        }).then((result) => {
            const parsedTransaction = this.formatter.transaction(signedTransaction)
            return this._wrapTransaction(parsedTransaction, result);
        }, (error) => {
            error.transaction = this.formatter.transaction(signedTransaction);
            if (error.transaction.hash) {
                (<any>error).transactionHash = error.transaction.hash;
            }
            throw error;
        });
    }

    _wrapTransaction(tx: EeaTransaction, hash?: string): TransactionResponse {
        if (hash != null && hexDataLength(hash) !== 32) { throw new Error("invalid response - sendPrivateTransaction"); }

        // @ts-ignore
        let result = <TransactionResponse>tx;

        // Check the hash we expect is the same as the hash the server reported
        if (hash != null && tx.hash !== hash) {
            // TODO do not throw an error for now.
            // Pantheon derives the transaction hash differently for private transactions so will remove this check for now
            // Pantheon transaction hash code
            // https://github.com/PegaSysEng/pantheon/blob/8d43c888491e10905c42be9a4feedbb1332c4ef5/ethereum/core/src/main/java/tech/pegasys/pantheon/ethereum/privacy/PrivateTransaction.java#L385
            tx.hash = hash
            // errors.throwError("Transaction hash mismatch from Provider.sendPrivateTransaction.", errors.UNKNOWN_ERROR, { expectedHash: tx.hash, returnedHash: hash });
        }

        // @TODO: (confirmations? number, timeout? number)
        result.wait = (confirmations?: number) => {

            // We know this transaction *must* exist (whether it gets mined is
            // another story), so setting an emitted value forces us to
            // wait even if the node returns null for the receipt
            if (confirmations !== 0) {
                this._emitted["t:" + tx.hash] = "pending";
            }

            return this.waitForTransaction(tx.hash, confirmations).then((receipt) => {
                if (receipt == null && confirmations === 0) { return null; }

                // No longer pending, allow the polling loop to garbage collect this
                this._emitted["t:" + tx.hash] = receipt.blockNumber;

                if (receipt.status === 0) {
                    errors.throwError("transaction failed", errors.CALL_EXCEPTION, {
                        transactionHash: tx.hash,
                        transaction: tx
                    });
                }
                return receipt;
            });
        };

        return result;
    }

    _getPrivacyGroupId(privacyGroupOptions: PrivacyGroupOptions | string): Promise<string> {

        let privacyGroupId: string

        if (typeof(privacyGroupOptions) === 'string') {
            if (privacyGroupOptions.length === 44) {
                privacyGroupId = privacyGroupOptions
            }
            else {
                errors.throwArgumentError("invalid privacyGroupOptions. Has to be base64 encoded if a string.", "privacyGroupOptions", privacyGroupOptions);
            }
        }
        else if (typeof(privacyGroupOptions) === 'object' &&
            typeof(privacyGroupOptions.privateFrom) === 'string' &&
            Array.isArray(privacyGroupOptions.privateFor)
        ) {
            privacyGroupId = generatePrivacyGroup(privacyGroupOptions)
        }
        else {
            errors.throwArgumentError("invalid privacyGroupOptions.", "privacyGroupOptions", privacyGroupOptions);
        }

        return Promise.resolve(privacyGroupId);
    }

    getPrivateTransactionCount(addressOrName: string | Promise<string>, privacyGroupOptions: PrivacyGroupOptions | string): Promise<number> {
        return this._runPerform("getPrivateTransactionCount", {
            address: () => this._getAddress(addressOrName),
            privacyGroupId: () => this._getPrivacyGroupId(privacyGroupOptions),
        }).then((result: any) => {
            return BigNumber.from(result).toNumber();
        });
    }

    getPrivateTransactionReceipt(transactionHash: string): Promise<TransactionReceipt> {
        return this.ready.then(() => {
            return resolveProperties({ transactionHash: transactionHash }).then(({ transactionHash }) => {
                let params = { transactionHash: this.formatter.hash(transactionHash, true) };
                return poll(() => {
                    return this.perform("getPrivateTransactionReceipt", params).then((result) => {
                        if (result == null) {
                            if (this._emitted["t:" + transactionHash] == null) {
                                return null;
                            }
                            return undefined;
                        } else if (result.code) {
                            errors.throwError(`Failed to get private transaction receipt for tx hash ${transactionHash}. Server error: ${result.message}.`, result.code,{
                                error: result.message,
                                transactionHash,
                            });
                        }

                        return this.formatter.privateReceipt(result);
                    }).catch((err) => {
                        errors.throwError(`Failed to get private transaction receipt for tx hash ${transactionHash}. Error: ${err.message}`, err.code, err);
                    });
                }, { onceBlock: this });
            });
        });
    }

    // Override the base perform method to add the eea calls
    perform(method: string, params: any): Promise<any> {
        switch (method) {
            case "sendPrivateTransaction":
                // method overridden to use EEA send raw transaction
                return this.send("eea_sendRawTransaction", [ params.signedTransaction ])
                    .catch((error: any) => {
                        if (error.responseText) {
                            // "insufficient funds for gas * price + value"
                            if (error.responseText.indexOf("insufficient funds") > 0) {
                                errors.throwError("insufficient funds", errors.INSUFFICIENT_FUNDS, { });
                            }
                            // "nonce too low"
                            if (error.responseText.indexOf("nonce too low") > 0) {
                                errors.throwError("nonce has already been used", errors.NONCE_EXPIRED, { });
                            }
                            // "replacement transaction underpriced"
                            if (error.responseText.indexOf("replacement transaction underpriced") > 0) {
                                errors.throwError("replacement fee too low", errors.REPLACEMENT_UNDERPRICED, { });
                            }
                        }
                        throw error;
                    });

            case "getPrivateTransactionCount":
                return this.send("eea_getTransactionCount", [ getLowerCase(params.address), params.privacyGroupId ]);

            case "getPrivateTransactionReceipt":
                return this.send("eea_getTransactionReceipt", [ params.transactionHash ]);

            default:
                return super.perform(method, params)
        }
    }


    // Convert an ethers.js transaction into a JSON-RPC transaction
    //  - gasLimit => gas
    //  - All values hexlified
    //  - All numeric values zero-striped
    // NOTE: This allows a TransactionRequest, but all values should be resolved
    //       before this is called
    static hexlifyTransaction(transaction: TransactionRequest, allowExtra?: { [key: string]: boolean }): { [key: string]: string } {
        // Check only allowed properties are given
        let allowed = shallowCopy(allowedTransactionKeys);
        if (allowExtra) {
            for (let key in allowExtra) {
                if (allowExtra[key]) { allowed[key] = true; }
            }
        }
        checkProperties(transaction, allowed);

        let result: { [key: string]: string } = {};

        // Some nodes (INFURA ropsten; INFURA mainnet is fine) do not like leading zeros.
        ["gasLimit", "gasPrice", "nonce", "value"].forEach(function(key) {
            if ((<any>transaction)[key] == null) { return; }
            let value = hexValue((<any>transaction)[key]);
            if (key === "gasLimit") { key = "gas"; }
            result[key] = value;
        });

        ["from", "to", "data"].forEach(function(key) {
            if ((<any>transaction)[key] == null) { return; }
            result[key] = hexlify((<any>transaction)[key]);
        });

        // Add extra EEA transaction keys
        ["privateFrom", "privateFor", "restricted"].forEach(function(key) {
            if ((<any>transaction)[key] == null) { return; }
            result[key] = hexlify((<any>transaction)[key]);
        });

        return result;
    }
}
