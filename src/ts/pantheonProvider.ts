
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

export type BlockParameter = number | 'earliest' | 'latest' | 'pending'

export class PantheonProvider extends PrivateJsonRpcProvider {

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

    // Miscellaneous
    getModuleVersions(): Promise<object> {
        return this._runPerform("getModuleVersions", {});
    }

    // Txpool
    getPantheonStatistics(): Promise<PantheonStatistics> {
        return this._runPerform("getPantheonStatistics", {});
    }

    getPantheonTransactions(): Promise<PantheonTransaction[]> {
        return this._runPerform("getPantheonTransactions", {});
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

    // Override the base perform method to add the pantheon API calls
    perform(method: string, params: any): Promise<any> {
        switch (method) {

            // Pantheon administration
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
            case "getPantheonStatistics":
                return this.send("txpool_pantheonStatistics", []);

            case "getPantheonTransactions":
                return this.send("txpool_pantheonTransactions", []);

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

            default:
                return super.perform(method, params)
        }
    }
}
