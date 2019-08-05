
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { hexDataLength, hexValue } from "@ethersproject/bytes";
import * as errors from "@ethersproject/errors";
import { Networkish } from "@ethersproject/networks";
import { checkProperties, resolveProperties, shallowCopy } from "@ethersproject/properties";
import { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers";
import { ConnectionInfo, fetchJson, poll } from "@ethersproject/web";

import { hexlify } from "./bytes";
import { PrivateFormatter } from './privateFormatter'
import { PrivacyGroupOptions, generatePrivacyGroup } from './privacyGroup'
import { allowedTransactionKeys, PrivateTransaction, PrivateTransactionReceipt, PrivateTransactionResponse } from './privateTransaction'
import { PrivateTransactionRequest } from './privateWallet'

const _constructorGuard = {};

export interface FindPrivacyGroup {
    privacyGroupId: string,
    members: string[],
    name?: string,
    description?: string,
}

export interface NodeInfo {
    enode: string,
    listenAddr: string,
    name : string,
    id: string,
    ports: {
        discovery: number
        listener: number
    },
    protocols: object[]
}

export interface PeerInfo {
    version: string,
    name: string,
    caps : string[],
    network: {
        localAddress: string,
        remoteAddress: string,
    },
    port: string,
    id: string,
}

export interface PantheonStatistics {
    maxSize: number,
    localCount: number,
    remoteCount: number,
}

export interface PantheonTransaction {
    hash: string,
    isReceivedFromLocalSource: boolean,
    addedToPoolAt: string,
}

export class PrivateJsonRpcSigner extends JsonRpcSigner {

    readonly provider: PrivateJsonRpcProvider

    constructor(constructorGuard: any, provider: PrivateJsonRpcProvider, addressOrIndex?: string | number) {

        if (constructorGuard !== _constructorGuard) {
            throw new Error("do not call the PrivateJsonRpcSigner constructor directly; use provider.getSigner");
        }

        super(constructorGuard, provider, addressOrIndex);
    }

    sendPrivateUncheckedTransaction(transaction: PrivateTransactionRequest): Promise<string> {
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

    sendPrivateTransaction(transaction: PrivateTransactionRequest): Promise<PrivateTransactionResponse> {
        return this.sendPrivateUncheckedTransaction(transaction).then((publicTransactionHash) => {
            return poll(() => {
                return this.provider.getPrivateTransaction(publicTransactionHash).then((tx: PrivateTransactionResponse) => {
                    if (tx === null) { return undefined; }
                    return this.provider._wrapPrivateTransaction(tx, publicTransactionHash);
                });
            }, { onceBlock: this.provider }).catch((error: Error) => {
                (<any>error).transactionHash = publicTransactionHash;
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

let defaultFormatter: PrivateFormatter = null;

export class PrivateJsonRpcProvider extends JsonRpcProvider {

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
            errors.throwArgumentError("invalid public transaction hash", "publicTransactionHash" , publicTransactionHash);
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
                    errors.throwError("transaction failed", errors.CALL_EXCEPTION, {
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
                        errors.throwError(`Failed to get private transaction receipt. Error: ${err.message}`, err.code, {
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
        members: string[] | Promise<string[]>,
        name?: string | Promise<string>,
        description?: string | Promise<string>,
    ): Promise<string> {
        return this._runPerform("createPrivacyGroup", {
            members: () => Promise.resolve(members),
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

    // Pantheon administration
    addPeer(
        enodeUrl: string | Promise<string>,
    ): Promise<boolean> {
        return this._runPerform("addPeer", {
            enodeUrl: () => Promise.resolve(enodeUrl)
        });
    }

    changeLogLevel(
        level: string | Promise<string>,
    ): Promise<boolean> {
        return this._runPerform("changeLogLevel", {
            level: () => Promise.resolve(level)
        });
    }

    getNodeInfo(): Promise<NodeInfo> {
        return this._runPerform("getNodeInfo", {});
    }

    getPeers(): Promise<PeerInfo[]> {
        return this._runPerform("getPeers", {});
    }

    removePeer(
        enodeUrl: string | Promise<string>,
    ): Promise<PeerInfo[]> {
        return this._runPerform("removePeer", {
            enodeUrl: () => Promise.resolve(enodeUrl)
        });
    }

    getModuleVersions(): Promise<object> {
        return this._runPerform("getModuleVersions", {});
    }

    getPantheonStatistics(): Promise<PantheonStatistics> {
        return this._runPerform("getPantheonStatistics", {});
    }

    getPantheonTransactions(): Promise<PantheonTransaction[]> {
        return this._runPerform("getPantheonTransactions", {});
    }

    // Override the base perform method to add the pantheon
    // calls
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

            case "privateCall":
                return this.send("priv_call", [ params.transaction, params.privacyGroupId ]);

            case "getPrivateTransactionCount":
                return this.send("priv_getTransactionCount", [ getLowerCase(params.address), params.privacyGroupId ]);

            case "getPrivateTransactionReceipt":
                return this.send("eea_getTransactionReceipt", [ params.transactionHash ]);

            case "getPrivateTransaction":
                return this.send("priv_getPrivateTransaction", [ params.transactionHash ]);

            // Privacy group management
            case "createPrivacyGroup":
                return this.send("priv_createPrivacyGroup", [
                    params.members,
                    params.name,
                    params.description]);

            case "deletePrivacyGroup":
                return this.send("priv_deletePrivacyGroup", [ params.privacyGroupId ]);

            case "findPrivacyGroup":
                return this.send("priv_findPrivacyGroup", [ params.members ]);

            case "getPrivacyPrecompileAddress":
                return this.send("priv_getPrivacyPrecompileAddress", []);

            // Pantheon administration
            case "addPeer":
                return this.send("admin_addPeer", [
                    params.enodeUrl
                ]);

            case "changeLogLevel":
                return this.send("admin_changeLogLevel", [
                    params.level
                ]);

            case "getNodeInfo":
                return this.send("admin_nodeInfo", []);

            case "getPeers":
                return this.send("admin_peers", []);

            case "removePeer":
                return this.send("admin_removePeer", [
                    params.enodeUrl
                ]);

            case "getModuleVersions":
                return this.send("rpc_modules", []);

            case "getPantheonStatistics":
                return this.send("txpool_pantheonStatistics", []);

            case "getPantheonTransactions":
                return this.send("txpool_pantheonTransactions", []);

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
