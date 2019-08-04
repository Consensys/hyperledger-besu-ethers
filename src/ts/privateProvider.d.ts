import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Networkish } from "@ethersproject/networks";
import { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers";
import { ConnectionInfo } from "@ethersproject/web";
import { PrivateFormatter } from './privateFormatter';
import { PrivacyGroupOptions } from './privacyGroup';
import { PrivateTransaction, PrivateTransactionReceipt, PrivateTransactionResponse } from './privateTransaction';
import { PrivateTransactionRequest } from './privateWallet';
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
export declare class PrivateJsonRpcSigner extends JsonRpcSigner {
    readonly provider: PrivateJsonRpcProvider;
    constructor(constructorGuard: any, provider: PrivateJsonRpcProvider, addressOrIndex?: string | number);
    sendPrivateUncheckedTransaction(transaction: PrivateTransactionRequest): Promise<string>;
    sendPrivateTransaction(transaction: PrivateTransactionRequest): Promise<PrivateTransactionResponse>;
}
export declare class PrivateJsonRpcProvider extends JsonRpcProvider {
    formatter: PrivateFormatter;
    constructor(url?: ConnectionInfo | string, network?: Networkish);
    static getFormatter(): PrivateFormatter;
    privateCall(transaction: PrivateTransactionRequest | Promise<PrivateTransactionRequest>): Promise<string>;
    send(method: string, params: any): Promise<any>;
    sendPrivateTransaction(signedTransaction: string | Promise<string>): Promise<PrivateTransactionResponse>;
    _wrapPrivateTransaction(tx: PrivateTransaction, publicHash?: string): PrivateTransactionResponse;
    waitForPrivateTransaction(transactionHash: string, confirmations?: number): Promise<PrivateTransactionReceipt>;
    getPrivateTransactionCount(addressOrName: string | Promise<string>, privacyGroupOptions: PrivacyGroupOptions): Promise<number>;
    getPrivateTransactionReceipt(privateTransactionHash: string): Promise<PrivateTransactionReceipt>;
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
    perform(method: string, params: any): Promise<any>;
    static hexlifyTransaction(transaction: TransactionRequest, allowExtra?: {
        [key: string]: boolean;
    }): {
        [key: string]: string;
    };
}
