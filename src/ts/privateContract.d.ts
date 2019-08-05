import { Signer } from "@ethersproject/abstract-signer";
import { Block, Log, Provider } from "@ethersproject/abstract-provider";
import { BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";
import { ContractFactory, ContractInterface } from '@ethersproject/contracts';
import { Contract } from "./contracts";
import { PrivateJsonRpcProvider, PrivateJsonRpcSigner } from './privateProvider';
import { PrivateTransactionReceipt, PrivateTransactionResponse } from './privateTransaction';
import { PrivacyGroupOptions } from './privacyGroup';
import { PrivateWallet } from './privateWallet';
export interface PrivateEvent extends Log {
    event?: string;
    eventSignature?: string;
    values?: Array<any>;
    decode?: (data: string, topics?: Array<string>) => any;
    removeListener: () => void;
    getBlock: () => Promise<Block>;
    getPrivateTransaction: () => Promise<PrivateTransactionResponse>;
    getPrivateTransactionReceipt: () => Promise<PrivateTransactionReceipt>;
}
export interface PrivateContractReceipt extends PrivateTransactionReceipt {
    events?: Array<PrivateEvent>;
}
export declare class PrivateContract extends Contract {
    readonly signer: PrivateWallet;
    readonly provider: PrivateJsonRpcProvider;
    readonly privacyGroupId: string;
    readonly deployPrivateTransaction: PrivateTransactionResponse;
    constructor(addressOrName: string, contractInterface: ContractInterface, signerOrProvider: PrivateJsonRpcSigner | PrivateJsonRpcProvider);
    connect(signerOrProvider: Signer | Provider | string): PrivateContract;
    attach(addressOrName: string): PrivateContract;
}
export declare class PrivateContractFactory extends ContractFactory {
    readonly signer: PrivateJsonRpcSigner;
    constructor(contractInterface: ContractInterface, bytecode: BytesLike | {
        object: string;
    }, signer?: PrivateWallet);
    privateDeploy(privacyGroupOptions: PrivacyGroupOptions, ...args: Array<any>): Promise<PrivateContract>;
    static getPrivateContract(address: string, contractInterface: ContractInterface, signer?: PrivateJsonRpcSigner): PrivateContract;
    static getPrivateContractAddress(transaction: {
        from: string;
        nonce: BigNumberish;
        privateFor: string;
        privateFrom: string;
    }): string;
}
