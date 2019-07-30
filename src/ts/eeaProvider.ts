
import { TransactionRequest } from "@ethersproject/abstract-provider";
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
import { allowedTransactionKeys, EeaTransaction, EeaTransactionReceipt, EeaTransactionResponse } from './eeaTransaction'
import { EeaTransactionRequest } from './eeaWallet'

const _constructorGuard = {};

export class EeaJsonRpcSigner extends JsonRpcSigner {

    readonly provider: EeaJsonRpcProvider

    constructor(constructorGuard: any, provider: EeaJsonRpcProvider, addressOrIndex?: string | number) {

        if (constructorGuard !== _constructorGuard) {
            throw new Error("do not call the EeaJsonRpcSigner constructor directly; use provider.getSigner");
        }

        super(constructorGuard, provider, addressOrIndex);
    }

    sendPrivateUncheckedTransaction(transaction: EeaTransactionRequest): Promise<string> {
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

    sendPrivateTransaction(transaction: EeaTransactionRequest): Promise<EeaTransactionResponse> {
        return this.sendPrivateUncheckedTransaction(transaction).then((hash) => {
            return poll(() => {
                return this.provider.getPrivateTransaction(hash).then((tx: EeaTransactionResponse) => {
                    if (tx === null) { return undefined; }
                    return this.provider._wrapPrivateTransaction(tx, hash);
                });
            }, { onceBlock: this.provider }).catch((error: Error) => {
                (<any>error).transactionHash = hash;
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

        return fetchJson(this.connection, JSON.stringify(request), getResult)
            .then((result) => {
                this.emit("debug", {
                    action: "send",
                    request: request,
                    response: result,
                    provider: this
                });

                if (result && result.message) {
                    throw errors.makeError(result.message, result.code, {})
                }

                return result;
            })
            .catch((err) => {
                throw errors.makeError(`Failed JSON-RPC call.`, err.code, {
                    method, params, cause: err,
                });
            });
    }

    sendPrivateTransaction(signedTransaction: string | Promise<string>): Promise<EeaTransactionResponse> {
        return this._runPerform("sendPrivateTransaction", {
            signedTransaction: () => Promise.resolve(signedTransaction).then(t => hexlify(t))
        }).then((result) => {
            const parsedTransaction = this.formatter.transaction(signedTransaction)
            return this._wrapPrivateTransaction(parsedTransaction, result);
        }, (error) => {
            error.transaction = this.formatter.transaction(signedTransaction);
            if (error.transaction.hash) {
                (<any>error).transactionHash = error.transaction.hash;
            }
            throw error;
        });
    }

    _wrapPrivateTransaction(tx: EeaTransaction, publicHash?: string): EeaTransactionResponse {
        if (publicHash != null && hexDataLength(publicHash) !== 32) {
            errors.throwArgumentError("invalid public hash", "publicHash" , publicHash);
        }

        let result = <EeaTransactionResponse>tx;

        tx.publicHash = publicHash

        // @TODO: (confirmations? number, timeout? number)
        result.wait = (confirmations?: number) => {

            // We know this transaction *must* exist (whether it gets mined is
            // another story), so setting an emitted value forces us to
            // wait even if the node returns null for the receipt
            if (confirmations !== 0) {
                this._emitted["t:" + tx.publicHash] = "pending";
            }

            return this.waitForTransaction(tx.publicHash, confirmations).then((receipt) => {
                if (receipt == null && confirmations === 0) { return null; }

                // No longer pending, allow the polling loop to garbage collect this
                this._emitted["t:" + tx.publicHash] = receipt.blockNumber;

                if (receipt.status === 0) {
                    errors.throwError("transaction failed", errors.CALL_EXCEPTION, {
                        publicHash: tx.publicHash,
                        transaction: tx
                    });
                }
                return receipt;
            });
        };

        return result;
    }

    getPrivateTransactionCount(
        addressOrName: string | Promise<string>,
        privacyGroupOptions: PrivacyGroupOptions,
    ): Promise<number> {
        return this._runPerform("getPrivateTransactionCount", {
            address: () => this._getAddress(addressOrName),
            privacyGroupId: () => Promise.resolve(generatePrivacyGroup(privacyGroupOptions)),
        }).then((result: any) => {
            return BigNumber.from(result).toNumber();
        });
    }

    getPrivateTransactionReceipt(privateTransactionHash: string): Promise<EeaTransactionReceipt> {
        return this.ready.then(() => {
            return resolveProperties({ transactionHash: privateTransactionHash }).then(({ transactionHash }) => {
                let params = { transactionHash: this.formatter.hash(transactionHash, true) };
                return poll(() => {
                    return this.perform("getPrivateTransactionReceipt", params).then((result) => {
                        if (result == null) {
                            if (this._emitted["t:" + transactionHash] == null) {
                                return null;
                            }
                            return undefined;
                        }

                        return this.formatter.privateReceipt(result);
                    }).catch((err) => {
                        errors.throwError(`Failed to get private transaction receipt. Error: ${err.message}`, err.code, {
                            err,
                            privateTransactionHash,
                        });
                    });
                }, { onceBlock: this });
            });
        });
    }

    getPrivateTransaction(transactionHash: string): Promise<EeaTransactionResponse> {
        return this.ready.then(() => {
            return resolveProperties({ transactionHash: transactionHash }).then(({ transactionHash }) => {
                let params = { transactionHash: this.formatter.hash(transactionHash, true) };
                return poll(() => {
                    return this.perform("getPrivateTransaction", params).then((result) => {
                        if (result == null) {
                            if (this._emitted["t:" + transactionHash] == null) {
                                return null;
                            }
                            return undefined;
                        }

                        let tx = this.formatter.privateTransactionResponse(result);

                        if (tx.blockNumber == null) {
                            tx.confirmations = 0;

                        } else if (tx.confirmations == null) {
                            return this._getFastBlockNumber().then((blockNumber) => {

                                // Add the confirmations using the fast block number (pessimistic)
                                let confirmations = (blockNumber - tx.blockNumber) + 1;
                                if (confirmations <= 0) { confirmations = 1; }
                                tx.confirmations = confirmations;

                                return this._wrapPrivateTransaction(tx);
                            });
                        }

                        return this._wrapPrivateTransaction(tx);
                    });
                }, { onceBlock: this });
            });
        });
    }

    createPrivacyGroup(
        privateFrom: string | Promise<string>,
        name: string | Promise<string>,
        description: string | Promise<string>,
        addresses: string[] | Promise<string[]>,
    ): Promise<string> {
        return this._runPerform("createPrivacyGroup", {
            privateFrom: () => Promise.resolve(privateFrom),
            name: () => Promise.resolve(name),
            description: () => Promise.resolve(description),
            addresses: () => Promise.resolve(addresses),
        });
    }

    deletePrivacyGroup(
        privacyGroupId: string | Promise<string>,
    ): Promise<string> {
        return this._runPerform("deletePrivacyGroup", {
            privacyGroupId: () => Promise.resolve(privacyGroupId),
        });
    }

    findPrivacyGroup(
        addresses: string[] | Promise<string[]>,
    ): Promise<string[]> {
        return this._runPerform("findPrivacyGroup", {
            addresses: () => Promise.resolve(addresses),
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
                return this.send("priv_getTransactionCount", [ getLowerCase(params.address), params.privacyGroupId ]);

            case "getPrivateTransactionReceipt":
                return this.send("eea_getTransactionReceipt", [ params.transactionHash ]);

            case "getPrivateTransaction":
                return this.send("priv_getPrivateTransaction", [ params.transactionHash ]);

            case "createPrivacyGroup":
                return this.send("priv_createPrivacyGroup", [
                    params.privateFrom,
                    params.name,
                    params.description,
                    params.addresses]);

            case "deletePrivacyGroup":
                return this.send("priv_deletePrivacyGroup", [ params.privateFrom, params.privacyGroupId ]);

            case "findPrivacyGroup":
                return this.send("priv_findPrivacyGroup", [ params.addresses ]);

            case "getPrivacyPrecompileAddress":
                return this.send("priv_getPrivacyPrecompileAddress", []);

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
