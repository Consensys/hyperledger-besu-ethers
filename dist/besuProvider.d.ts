import { PrivateJsonRpcProvider } from './privateProvider';
export interface NodeInfo {
    enode: string;
    listenAddr: string;
    name: string;
    id: string;
    ports: {
        discovery: number;
        listener: number;
    };
    protocols: object[];
}
export interface PeerInfo {
    version: string;
    name: string;
    caps: string[];
    network: {
        localAddress: string;
        remoteAddress: string;
    };
    port: string;
    id: string;
}
export interface BesuStatistics {
    maxSize: number;
    localCount: number;
    remoteCount: number;
}
export interface BesuTransaction {
    hash: string;
    isReceivedFromLocalSource: boolean;
    addedToPoolAt: string;
}
export declare type BlockParameter = number | 'earliest' | 'latest' | 'pending';
export declare type PermissioningResult = 'Success' | 'error';
export declare class BesuProvider extends PrivateJsonRpcProvider {
    addPeer(enodeUrl: string | Promise<string>): Promise<boolean>;
    changeLogLevel(level: string | Promise<string>): Promise<boolean>;
    getNodeInfo(): Promise<NodeInfo>;
    getPeers(): Promise<PeerInfo[]>;
    removePeer(enodeUrl: string | Promise<string>): Promise<PeerInfo[]>;
    getModuleVersions(): Promise<object>;
    getBesuStatistics(): Promise<BesuStatistics>;
    getBesuTransactions(): Promise<BesuTransaction[]>;
    cliqueDiscard(signerAddress: string): Promise<boolean>;
    cliqueGetSigners(blockParameter: BlockParameter): Promise<string[]>;
    cliqueGetSignersAtHash(hash: string): Promise<string[]>;
    cliquePropose(signerAddress: string, add: boolean): Promise<boolean>;
    cliqueGetProposals(): Promise<{
        [index: string]: boolean;
    }[]>;
    ibftDiscardValidatorVote(validatorAddress: string): Promise<boolean>;
    ibftGetPendingVotes(): Promise<{
        [index: string]: boolean;
    }[]>;
    ibftGetValidatorsByBlockHash(hash: string): Promise<string[]>;
    ibftGetValidatorsByBlockNumber(blockParameter: BlockParameter): Promise<string[]>;
    ibftProposeValidatorVote(validatorAddress: string, add: boolean): Promise<boolean>;
    addAccountsToWhitelist(accounts: string[] | Promise<string[]>): Promise<PermissioningResult>;
    getAccountsWhitelist(): Promise<string[]>;
    removeAccountsFromWhitelist(accounts: string[] | Promise<string[]>): Promise<PermissioningResult>;
    addNodesToWhitelist(nodes: string[] | Promise<string[]>): Promise<PermissioningResult>;
    getNodesWhitelist(): Promise<string[]>;
    removeNodesFromWhitelist(nodes: string[] | Promise<string[]>): Promise<PermissioningResult>;
    reloadPermissionsFromFile(): Promise<PermissioningResult>;
    perform(method: string, params: any): Promise<any>;
}
