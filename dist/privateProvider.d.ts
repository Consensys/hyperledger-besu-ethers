import { Networkish } from "@ethersproject/networks";
import { JsonRpcProvider, Provider } from "@ethersproject/providers";
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
export interface PrivateProvider extends Provider {
    sendPrivateTransaction(signedTransaction: string | Promise<string>): Promise<PrivateTransactionResponse>;
    getPrivateTransactionCount(addressOrName: string | Promise<string>, privacyGroupOptions: PrivacyGroupOptions): Promise<number>;
    getPrivateTransactionReceipt(publicTransactionHash: string): Promise<PrivateTransactionReceipt>;
    getPrivateTransaction(transactionHash: string): Promise<PrivateTransactionResponse>;
    createPrivacyGroup(members: string[] | Promise<string[]>, name?: string | Promise<string>, description?: string | Promise<string>): Promise<string>;
    deletePrivacyGroup(privacyGroupId: string | Promise<string>): Promise<string>;
    findPrivacyGroup(members: string[] | Promise<string[]>): Promise<FindPrivacyGroup[]>;
    getPrivacyPrecompileAddress(): Promise<string>;
}
export declare class PrivateJsonRpcProvider extends JsonRpcProvider implements PrivateProvider {
    formatter: PrivateFormatter;
    constructor(url?: ConnectionInfo | string, network?: Networkish);
    static getFormatter(): PrivateFormatter;
    send(method: string, params: any): Promise<any>;
    sendPrivateTransaction(signedTransaction: string | Promise<string>): Promise<PrivateTransactionResponse>;
    _wrapPrivateTransaction(tx: PrivateTransaction, publicTransactionHash?: string): PrivateTransactionResponse;
    getPrivateTransactionCount(addressOrName: string | Promise<string>, privacyGroupOptions: PrivacyGroupOptions): Promise<number>;
    getPrivateTransactionReceipt(publicTransactionHash: string): Promise<PrivateTransactionReceipt>;
    getPrivateTransaction(transactionHash: string): Promise<PrivateTransactionResponse>;
    createPrivacyGroup(addresses: string[] | Promise<string[]>, name?: string | Promise<string>, description?: string | Promise<string>): Promise<string>;
    deletePrivacyGroup(privacyGroupId: string | Promise<string>): Promise<string>;
    findPrivacyGroup(members: string[] | Promise<string[]>): Promise<FindPrivacyGroup[]>;
    getPrivacyPrecompileAddress(): Promise<string>;
    perform(method: string, params: any): Promise<any>;
}
