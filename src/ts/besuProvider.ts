
import { PrivateJsonRpcProvider }  from './privateProvider'

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

export interface BesuStatistics {
    maxSize: number,
    localCount: number,
    remoteCount: number,
}

export interface BesuTransaction {
    hash: string,
    isReceivedFromLocalSource: boolean,
    addedToPoolAt: string,
}

export type BlockParameter = number | 'earliest' | 'latest' | 'pending'
export type PermissioningResult = 'Success' | 'error'

export class BesuProvider extends PrivateJsonRpcProvider {

    // Besu administration
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

    // Miscellaneous
    getModuleVersions(): Promise<object> {
        return this._runPerform("getModuleVersions", {});
    }

    // Txpool
    getBesuStatistics(): Promise<BesuStatistics> {
        return this._runPerform("getBesuStatistics", {});
    }

    getBesuTransactions(): Promise<BesuTransaction[]> {
        return this._runPerform("getBesuTransactions", {});
    }

    // Clique
    cliqueDiscard(signerAddress: string): Promise<boolean> {
        return this._runPerform("cliqueDiscard", {
            signerAddress: () => Promise.resolve(signerAddress)
        });
    }

    cliqueGetSigners(blockParameter: BlockParameter): Promise<string[]> {
        return this._runPerform("cliqueGetSigners", {
            blockParameter: () => Promise.resolve(blockParameter)
        });
    }

    cliqueGetSignersAtHash(hash: string): Promise<string[]> {
        return this._runPerform("cliqueGetSigners", {
            hash: () => Promise.resolve(hash)
        });
    }

    cliquePropose(signerAddress: string, add: boolean): Promise<boolean> {
        return this._runPerform("cliquePropose", {
            signerAddress: () => Promise.resolve(signerAddress),
            add: () => Promise.resolve(add),
        });
    }

    cliqueGetProposals(): Promise<{[index:string] : boolean}[]> {
        return this._runPerform("cliqueGetProposals", {});
    }

    // IBFT
    ibftDiscardValidatorVote(validatorAddress: string): Promise<boolean> {
        return this._runPerform("ibftDiscardValidatorVote", {
            validatorAddress: () => Promise.resolve(validatorAddress)
        });
    }

    ibftGetPendingVotes(): Promise<{[index:string] : boolean}[]> {
        return this._runPerform("ibftGetPendingVotes", {});
    }

    ibftGetValidatorsByBlockHash(hash: string): Promise<string[]> {
        return this._runPerform("ibftGetValidatorsByBlockHash", {
            hash: () => Promise.resolve(hash)
        });
    }

    ibftGetValidatorsByBlockNumber(blockParameter: BlockParameter): Promise<string[]> {
        return this._runPerform("ibftGetValidatorsByBlockNumber", {
            blockParameter: () => Promise.resolve(blockParameter)
        });
    }

    ibftProposeValidatorVote(validatorAddress: string, add: boolean): Promise<boolean> {
        return this._runPerform("ibftProposeValidatorVote", {
            validatorAddress: () => Promise.resolve(validatorAddress),
            add: () => Promise.resolve(add),
        });
    }

    // Permissioning
    addAccountsToWhitelist(
        accounts: string[] | Promise<string[]>,
    ): Promise<PermissioningResult> {
        return this._runPerform("addAccountsToWhitelist", {
            accounts: () => Promise.resolve(accounts),
        });
    }

    getAccountsWhitelist(): Promise<string[]> {
        return this._runPerform("getAccountsWhitelist", { });
    }

    removeAccountsFromWhitelist(
        accounts: string[] | Promise<string[]>,
    ): Promise<PermissioningResult> {
        return this._runPerform("removeAccountsFromWhitelist", {
            accounts: () => Promise.resolve(accounts),
        });
    }

    addNodesToWhitelist(
        nodes: string[] | Promise<string[]>,
    ): Promise<PermissioningResult> {
        return this._runPerform("addNodesToWhitelist", {
            nodes: () => Promise.resolve(nodes),
        });
    }

    getNodesWhitelist(): Promise<string[]> {
        return this._runPerform("getNodesWhitelist", { });
    }

    removeNodesFromWhitelist(
        nodes: string[] | Promise<string[]>,
    ): Promise<PermissioningResult> {
        return this._runPerform("removeNodesFromWhitelist", {
            nodes: () => Promise.resolve(nodes),
        });
    }

    reloadPermissionsFromFile(): Promise<PermissioningResult> {
        return this._runPerform("reloadPermissionsFromFile", { });
    }

    // Override the base perform method to add the Besu API calls
    perform(method: string, params: any): Promise<any> {
        switch (method) {

            // administration
            case "addPeer":
                return this.send("admin_addPeer", [
                    params.enodeUrl,
                ]);

            case "changeLogLevel":
                return this.send("admin_changeLogLevel", [
                    params.level,
                ]);

            case "getNodeInfo":
                return this.send("admin_nodeInfo", []);

            case "getPeers":
                return this.send("admin_peers", []);

            case "removePeer":
                return this.send("admin_removePeer", [
                    params.enodeUrl,
                ]);

            // Miscellaneous
            case "getModuleVersions":
                return this.send("rpc_modules", []);

            // Txpool
            case "getBesuStatistics":
                return this.send("txpool_besuStatistics", []);

            case "getBesuTransactions":
                return this.send("txpool_besuTransactions", []);

            // Clique
            case "cliqueDiscard":
                return this.send("clique_discard", [
                    params.signerAddress,
                ]);

            case "cliqueGetSigners":
                return this.send("clique_getSigners", [
                    params.blockParameter,
                ]);

            case "cliqueGetSignersAtHash":
                return this.send("clique_getSignersAtHash", [
                    params.hash,
                ]);

            case "cliquePropose":
                return this.send("clique_propose", [
                    params.signerAddress,
                    params.add,
                ]);

            case "cliqueProposals":
                return this.send("clique_proposals", []);

            // IBFT
            case "ibftDiscardValidatorVote":
                return this.send("ibft_discardValidatorVote", [
                    params.validatorAddress,
                ]);

            case "ibftGetPendingVotes":
                return this.send("ibft_getPendingVotes", []);

            case "ibftGetValidatorsByBlockHash":
                return this.send("ibft_getValidatorsByBlockHash", [
                    params.hash,
                ]);

            case "ibftGetValidatorsByBlockNumber":
                return this.send("ibft_getValidatorsByBlockNumber", [
                    params.blockParameter,
                ]);

            case "ibftProposeValidatorVote":
                return this.send("ibft_proposeValidatorVote", [
                    params.validatorAddress,
                    params.add,
                ]);

            // Permissioning
            case "addAccountsToWhitelist":
                return this.send("perm_addAccountsToWhitelist", [ params.accounts ]);

            case "getAccountsWhitelist":
                return this.send("perm_getAccountsWhitelist", []);

            case "removeAccountsFromWhitelist":
                return this.send("perm_removeAccountsFromWhitelist", [ params.accounts ]);

            case "addNodesToWhitelist":
                return this.send("perm_addAccountsToWhitelist", [ params.nodes ]);

            case "getNodesWhitelist":
                return this.send("perm_getAccountsWhitelist", []);

            case "removeNodesFromWhitelist":
                return this.send("perm_removeAccountsFromWhitelist", [ params.nodes ]);

            case "reloadPermissionsFromFile":
                return this.send("perm_reloadPermissionsFromFile", []);

            default:
                return super.perform(method, params)
        }
    }
}
