
import { BigNumber } from "@ethersproject/bignumber";
import { hexDataLength } from "@ethersproject/bytes";
import { Networkish } from "@ethersproject/networks";
import { resolveProperties } from "@ethersproject/properties";
import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import { ConnectionInfo, fetchJson, poll } from "@ethersproject/web";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";

const logger = new Logger(version);

import { hexlify } from "./bytes";
import { PrivateFormatter } from './privateFormatter'
import { PrivacyGroupOptions, generatePrivacyGroup } from './privacyGroup'
import { PrivateTransaction, PrivateTransactionReceipt, PrivateTransactionResponse } from './privateTransaction'

export interface FindPrivacyGroup {
    privacyGroupId: string,
    members: string[],
    name?: string,
    description?: string,
}

export interface PrivateProvider extends Provider {
    sendPrivateTransaction(signedTransaction: string | Promise<string>): Promise<PrivateTransactionResponse>,
    getPrivateTransactionCount(addressOrName: string | Promise<string>, privacyGroupOptions: PrivacyGroupOptions): Promise<number>,
    getPrivateTransactionReceipt(publicTransactionHash: string): Promise<PrivateTransactionReceipt>,
    getPrivateTransaction(transactionHash: string): Promise<PrivateTransactionResponse>

    // Privacy Group functions
    createPrivacyGroup(members: string[] | Promise<string[]>, name?: string | Promise<string>, description?: string | Promise<string>): Promise<string>,
    deletePrivacyGroup(privacyGroupId: string | Promise<string>): Promise<string>,
    findPrivacyGroup(members: string[] | Promise<string[]>): Promise<FindPrivacyGroup[]>,
    getPrivacyPrecompileAddress(): Promise<string>
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

let defaultFormatter: PrivateFormatter = null;

export class PrivateJsonRpcProvider extends JsonRpcProvider implements PrivateProvider {

    formatter: PrivateFormatter;

    constructor(url?: ConnectionInfo | string, network?: Networkish) {

        super(url, network);

        this.formatter = new.target.getFormatter();
    }

    static getFormatter(): PrivateFormatter {
        if (defaultFormatter == null) {
            defaultFormatter = new PrivateFormatter();
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
                    throw logger.makeError(result.message, result.code, {})
                }

                return result;
            })
            .catch((err) => {
                throw logger.makeError(`Failed JSON-RPC call.`, err.code, {
                    method, params, cause: err,
                });
            });
    }

    sendPrivateTransaction(signedTransaction: string | Promise<string>): Promise<PrivateTransactionResponse> {
        return this._runPerform("sendPrivateTransaction", {
            signedTransaction: () => Promise.resolve(signedTransaction).then(t => hexlify(t))
        }).then(publicTransactionHash => {
            const parsedTransaction = this.formatter.transaction(signedTransaction)
            return this._wrapPrivateTransaction(parsedTransaction, publicTransactionHash);
        }, error => {
            error.transaction = this.formatter.transaction(signedTransaction);
            if (error.transaction.hash) {
                (<any>error).transactionHash = error.transaction.hash;
            }
            throw error;
        });
    }

    _wrapPrivateTransaction(tx: PrivateTransaction, publicTransactionHash?: string): PrivateTransactionResponse {
        if (publicTransactionHash != null && hexDataLength(publicTransactionHash) !== 32) {
            logger.throwArgumentError("invalid public transaction hash", "publicTransactionHash" , publicTransactionHash);
        }

        let result = <PrivateTransactionResponse>tx;

        tx.publicHash = publicTransactionHash

        result.wait = (confirmations?: number) => {

            // We know this transaction *must* exist (whether it gets mined is
            // another story), so setting an emitted value forces us to
            // wait even if the node returns null for the receipt
            if (confirmations !== 0) {
                this._emitted["t:" + tx.publicHash] = "pending";
            }

            // wait for the public marker transaction to be mined
            return this.waitForTransaction(tx.publicHash, confirmations).then(async (publicReceipt) => {
                if (publicReceipt == null && confirmations === 0) { return null; }

                // No longer pending, allow the polling loop to garbage collect this
                this._emitted["t:" + tx.publicHash] = publicReceipt.blockNumber;

                if (publicReceipt.status === 0) {
                    logger.throwError("transaction failed", Logger.errors.CALL_EXCEPTION, {
                        publicHash: tx.publicHash,
                        transaction: tx
                    });
                }

                // get private transaction receipt
                const privateReceipt = await this.getPrivateTransactionReceipt(tx.publicHash)

                // merge the public and private transaction receipts
                return {
                    ...publicReceipt,
                    contractAddress: privateReceipt.contractAddress,
                    logs: privateReceipt.logs,
                    from: privateReceipt.from,
                    to: privateReceipt.to,
                    output: privateReceipt.output,
                }
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

    getPrivateTransactionReceipt(publicTransactionHash: string): Promise<PrivateTransactionReceipt> {
        return this.ready.then(() => {
            return resolveProperties({ transactionHash: publicTransactionHash }).then(({ transactionHash }) => {
                let params = { transactionHash: this.formatter.hash(transactionHash, true) };
                return poll(() => {
                    // TODO refactor this to use asymnc/await to make it easier to read
                    return this.perform("getPrivateTransactionReceipt", params).then((result) => {
                        if (result == null) {
                            if (this._emitted["t:" + transactionHash] == null) {
                                return null;
                            }
                            return undefined;
                        }

                        const receipt = this.formatter.privateReceipt(result);

                        return receipt;
                    }).then(async (privateReceipt) => {
                        if (privateReceipt == undefined || privateReceipt == null) {
                            return privateReceipt;
                        }

                        return this.getTransactionReceipt(publicTransactionHash).then(result => {

                            const publicReceipt = this.formatter.receipt(result);

                            // Merge the public and private transaction receipts
                            const receipt = {
                                ...publicReceipt,
                                contractAddress: privateReceipt.contractAddress,
                                logs: privateReceipt.logs,
                                from: privateReceipt.from,
                                to: privateReceipt.to,
                                output: privateReceipt.output,
                            }

                            if (receipt.blockNumber == null) {
                                receipt.confirmations = 0;

                            } else if (receipt.confirmations == null) {
                                return this._getFastBlockNumber().then((blockNumber) => {

                                    // Add the confirmations using the fast block number (pessimistic)
                                    let confirmations = (blockNumber - receipt.blockNumber) + 1;
                                    if (confirmations <= 0) { confirmations = 1; }
                                    receipt.confirmations = confirmations;

                                    return receipt;
                                });
                            }

                            return receipt
                        })
                    }).catch((err) => {
                        logger.throwError(`Failed to get private transaction receipt. Error: ${err.message}`, err.code, {
                            err,
                            publicTransactionHash,
                        });
                    });
                }, { onceBlock: this });
            });
        });
    }

    getPrivateTransaction(transactionHash: string): Promise<PrivateTransactionResponse> {
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

                        const tx = this.formatter.privateTransactionResponse(result);

                        // TODO does this work for private transactions?
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
        addresses: string[] | Promise<string[]>,
        name?: string | Promise<string>,
        description?: string | Promise<string>,
    ): Promise<string> {
        return this._runPerform("createPrivacyGroup", {
            addresses: () => Promise.resolve(addresses),
            name: () => Promise.resolve(name),
            description: () => Promise.resolve(description),
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
        members: string[] | Promise<string[]>,
    ): Promise<FindPrivacyGroup[]> {
        return this._runPerform("findPrivacyGroup", {
            members: () => Promise.resolve(members),
        });
    }

    getPrivacyPrecompileAddress(): Promise<string> {
        return this._runPerform("getPrivacyPrecompileAddress", {});
    }

    // Override the base perform method to add the private API calls
    perform(method: string, params: any): Promise<any> {
        switch (method) {
            // privacy transactions
            case "sendPrivateTransaction":
                // method overridden to use EEA send raw transaction
                return this.send("eea_sendRawTransaction", [ params.signedTransaction ])
                    .catch((error: any) => {
                        if (error.responseText) {
                            // "insufficient funds for gas * price + value"
                            if (error.responseText.indexOf("insufficient funds") > 0) {
                                logger.throwError("insufficient funds", Logger.errors.INSUFFICIENT_FUNDS, { });
                            }
                            // "nonce too low"
                            if (error.responseText.indexOf("nonce too low") > 0) {
                                logger.throwError("nonce has already been used", Logger.errors.NONCE_EXPIRED, { });
                            }
                            // "replacement transaction underpriced"
                            if (error.responseText.indexOf("replacement transaction underpriced") > 0) {
                                logger.throwError("replacement fee too low", Logger.errors.REPLACEMENT_UNDERPRICED, { });
                            }
                        }
                        throw error;
                    });

            case "privateCall":
                return this.send("priv_call", [ params.transaction, params.privacyGroupId ]);

            case "getPrivateTransactionCount":
                return this.send("priv_getTransactionCount", [ getLowerCase(params.address), params.privacyGroupId ]);

            case "getPrivateTransactionReceipt":
                return this.send("priv_getTransactionReceipt", [ params.transactionHash ]);

            case "getPrivateTransaction":
                return this.send("priv_getPrivateTransaction", [ params.transactionHash ]);

            // Privacy group management
            case "createPrivacyGroup":
                return this.send("priv_createPrivacyGroup", [ params ]);

            case "deletePrivacyGroup":
                return this.send("priv_deletePrivacyGroup", [ params.privacyGroupId ]);

            case "findPrivacyGroup":
                return this.send("priv_findPrivacyGroup", [ params.members ]);

            case "getPrivacyPrecompileAddress":
                return this.send("priv_getPrivacyPrecompileAddress", []);

            default:
                return super.perform(method, params)
        }
    }
}
