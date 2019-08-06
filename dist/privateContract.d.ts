import { Block, Log } from "@ethersproject/abstract-provider";
import { BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";
import { ContractFactory, ContractInterface } from '@ethersproject/contracts';
import { Contract } from "./contracts";
import { PrivateProvider } from './privateProvider';
import { PrivateTransactionReceipt, PrivateTransactionResponse } from './privateTransaction';
import { PrivacyGroupOptions } from './privacyGroup';
import { PrivateSigner } from './privateWallet';
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
    readonly signer: PrivateSigner;
    readonly provider: PrivateProvider;
    readonly privacyGroupId: string;
    readonly deployPrivateTransaction: PrivateTransactionResponse;
    readonly privacyGroupOptions: PrivacyGroupOptions;
    constructor(addressOrName: string, privacyGroupOptions: PrivacyGroupOptions, contractInterface: ContractInterface, signerOrProvider: PrivateSigner | PrivateProvider);
    connect(signerOrProvider: PrivateSigner | PrivateProvider): PrivateContract;
    attach(addressOrName: string): PrivateContract;
}
export declare class PrivateContractFactory extends ContractFactory {
    readonly signer: PrivateSigner;
    constructor(contractInterface: ContractInterface, bytecode: BytesLike | {
        object: string;
    }, signer?: PrivateSigner);
    privateDeploy(privacyGroupOptions: PrivacyGroupOptions, ...args: Array<any>): Promise<PrivateContract>;
    static getPrivateContract(address: string, privacyGroupOptions: PrivacyGroupOptions, contractInterface: ContractInterface, signer?: PrivateSigner): PrivateContract;
    static getPrivateContractAddress(transaction: {
        from: string;
        nonce: BigNumberish;
        privateFor: string;
        privateFrom?: string;
        restriction: 'restricted' | 'unrestricted';
    }): string;
}
