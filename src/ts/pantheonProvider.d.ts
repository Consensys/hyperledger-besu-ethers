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
export interface PantheonStatistics {
    maxSize: number;
    localCount: number;
    remoteCount: number;
}
export interface PantheonTransaction {
    hash: string;
    isReceivedFromLocalSource: boolean;
    addedToPoolAt: string;
}
export declare class PantheonProvider extends PrivateJsonRpcProvider {
    addPeer(enodeUrl: string | Promise<string>): Promise<boolean>;
    changeLogLevel(level: string | Promise<string>): Promise<boolean>;
    getNodeInfo(): Promise<NodeInfo>;
    getPeers(): Promise<PeerInfo[]>;
    removePeer(enodeUrl: string | Promise<string>): Promise<PeerInfo[]>;
    getModuleVersions(): Promise<object>;
    getPantheonStatistics(): Promise<PantheonStatistics>;
    getPantheonTransactions(): Promise<PantheonTransaction[]>;
    perform(method: string, params: any): Promise<any>;
}
