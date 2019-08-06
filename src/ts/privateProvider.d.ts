import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Networkish } from "@ethersproject/networks";
import { JsonRpcProvider } from "@ethersproject/providers";
import { ConnectionInfo } from "@ethersproject/web";
import { PrivateFormatter } from './privateFormatter';
import { PrivacyGroupOptions } from './privacyGroup';
import { PrivateTransaction, PrivateTransactionReceipt, PrivateTransactionResponse } from './privateTransaction';
export interface FindPrivacyGroup {
    privacyGroupId: string;
    members: string[];
    name?: string;
    description?: string;
}
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
export declare class PrivateJsonRpcProvider extends JsonRpcProvider {
    formatter: PrivateFormatter;
    constructor(url?: ConnectionInfo | string, network?: Networkish);
    static getFormatter(): PrivateFormatter;
    send(method: string, params: any): Promise<any>;
    sendPrivateTransaction(signedTransaction: string | Promise<string>): Promise<PrivateTransactionResponse>;
    _wrapPrivateTransaction(tx: PrivateTransaction, publicTransactionHash?: string): PrivateTransactionResponse;
    getPrivateTransactionCount(addressOrName: string | Promise<string>, privacyGroupOptions: PrivacyGroupOptions): Promise<number>;
    getPrivateTransactionReceipt(publicTransactionHash: string): Promise<PrivateTransactionReceipt>;
    getPrivateTransaction(transactionHash: string): Promise<PrivateTransactionResponse>;
    createPrivacyGroup(members: string[] | Promise<string[]>, name?: string | Promise<string>, description?: string | Promise<string>): Promise<string>;
    deletePrivacyGroup(privacyGroupId: string | Promise<string>): Promise<string>;
    findPrivacyGroup(members: string[] | Promise<string[]>): Promise<FindPrivacyGroup[]>;
    getPrivacyPrecompileAddress(): Promise<string>;
    addPeer(enodeUrl: string | Promise<string>): Promise<boolean>;
    changeLogLevel(level: string | Promise<string>): Promise<boolean>;
    getNodeInfo(): Promise<NodeInfo>;
    getPeers(): Promise<PeerInfo[]>;
    removePeer(enodeUrl: string | Promise<string>): Promise<PeerInfo[]>;
    getModuleVersions(): Promise<object>;
    getPantheonStatistics(): Promise<PantheonStatistics>;
    getPantheonTransactions(): Promise<PantheonTransaction[]>;
    perform(method: string, params: any): Promise<any>;
    static hexlifyTransaction(transaction: TransactionRequest, allowExtra?: {
        [key: string]: boolean;
    }): {
        [key: string]: string;
    };
}
