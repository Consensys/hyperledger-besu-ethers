
import { ParamType } from "@ethersproject/abi";
import { Signer, VoidSigner } from "@ethersproject/abstract-signer";
import { Block, Log, Provider } from "@ethersproject/abstract-provider";
import { getAddress } from "@ethersproject/address";
import { arrayify, hexDataSlice, stripZeros } from "@ethersproject/bytes";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";
import { Zero } from "@ethersproject/constants";
import * as errors from "@ethersproject/errors";
import { keccak256 } from "@ethersproject/keccak256";
import { defineReadOnly, deepCopy, resolveProperties, shallowCopy } from "@ethersproject/properties";
import { encode } from "@ethersproject/rlp";

import { ContractFactory, ContractInterface } from '@ethersproject/contracts';
// FIXME a workaround until this Ethers issue has been solved https://github.com/ethers-io/ethers.js/issues/577
import { Contract } from "./contracts";

import { PrivateJsonRpcProvider, PrivateJsonRpcSigner } from './privateProvider'
import { allowedTransactionKeys, PrivateTransactionReceipt, PrivateTransactionResponse } from './privateTransaction'
import {generatePrivacyGroup, PrivacyGroupOptions} from './privacyGroup'
import { PrivateWallet } from './privateWallet'

type RunFunction = (...params: Array<any>) => Promise<any>;

type RunOptions = {
    estimate?: boolean;
    callStatic?: boolean;
    payable?: boolean;
    transaction?: boolean;
};

export interface PrivateEvent extends Log {

    // The event name
    event?: string;

    // The event signature
    eventSignature?: string;

    // The parsed arguments to the event
    values?: Array<any>;

    // A function that can be used to decode event data and topics
    decode?: (data: string, topics?: Array<string>) => any;

    // A function that will remove the listener responsible for this event (if any)
    removeListener: () => void;

    // Get blockchain details about this event's block and transaction
    getBlock: () => Promise<Block>;
    getPrivateTransaction: () => Promise<PrivateTransactionResponse>;
    getPrivateTransactionReceipt: () => Promise<PrivateTransactionReceipt>;
}

export interface PrivateContractReceipt extends PrivateTransactionReceipt {
    events?: Array<PrivateEvent>;
}

export class PrivateContract extends Contract {

    readonly signer: PrivateWallet;
    readonly provider: PrivateJsonRpcProvider;
    readonly privacyGroupId: string;
    readonly deployPrivateTransaction: PrivateTransactionResponse;

    constructor(
        addressOrName: string,
        contractInterface: ContractInterface,
        signerOrProvider: PrivateJsonRpcSigner | PrivateJsonRpcProvider)
    {
        super(addressOrName, contractInterface, signerOrProvider, runPrivateMethod);
    }

    connect(signerOrProvider: Signer | Provider | string): PrivateContract {
        if (typeof(signerOrProvider) === "string") {
            signerOrProvider = new VoidSigner(signerOrProvider, this.provider);
        }

        let contract = new (<{ new(...args: any[]): PrivateContract }>(this.constructor))(this.address, this.interface, signerOrProvider);
        if (this.deployPrivateTransaction) {
            defineReadOnly(contract, "deployPrivateTransaction", this.deployPrivateTransaction);
        }
        return contract;
    }

    // Re-attach to a different on-chain instance of this contract
    attach(addressOrName: string): PrivateContract {
        return new (<{ new(...args: any[]): PrivateContract }>(this.constructor))(addressOrName, this.interface, this.signer || this.provider);
    }
}

function runPrivateMethod(contract: PrivateContract, functionName: string, options: RunOptions): RunFunction {
    let method = contract.interface.functions[functionName];
    return function(...params): Promise<any> {
        let tx: any = {}

        // If 1 extra parameter was passed in, it contains overrides
        if (params.length === method.inputs.length + 1 && typeof(params[params.length - 1]) === "object") {
            tx = shallowCopy(params.pop());

            delete tx.blockTag;

            // Check for unexpected keys (e.g. using "gas" instead of "gasLimit")
            for (let key in tx) {
                if (!allowedTransactionKeys[key]) {
                    errors.throwError(("unknown transaction override - " + key), "overrides", tx);
                }
            }
        }

        errors.checkArgumentCount(params.length, method.inputs.length, "passed to contract");

        // Check overrides make sense
        ["data", "to", 'privateFrom', 'privateFor', 'restriction'].forEach(function(key) {
            if (tx[key] != null) {
                errors.throwError("cannot override " + key, errors.UNSUPPORTED_OPERATION, { operation: key });
            }
        });

        // FIXME until Pantheon supports priv_getCode, we can't check if the contract has been mined
        // So for now we'll just assume the contract has been mined
        tx.to = contract.addressPromise;
        // // If the contract was just deployed, wait until it is minded
        // if (contract.deployPrivateTransaction != null) {
        //     tx.to = contract._deployed(blockTag).then(() => {
        //         return contract.addressPromise;
        //     });
        // } else {
        //     tx.to = contract.addressPromise;
        // }

        return resolveAddresses(contract.signer || contract.provider, params, method.inputs).then((params) => {
            tx.data = contract.interface.encodeFunctionData(method, params);

            // Add private transaction properties to the transaction
            if (contract.deployPrivateTransaction) {
                if (contract.deployPrivateTransaction.privateFrom) {
                    tx.privateFrom = contract.deployPrivateTransaction.privateFrom
                }
                tx.privateFor = contract.deployPrivateTransaction.privateFor
                tx.restriction = contract.deployPrivateTransaction.restriction
            }
            else {
                errors.throwError("private transaction not sent as contract not yet deployed", errors.UNSUPPORTED_OPERATION, {
                    transaction: tx,
                    deployPrivateTransaction: contract.deployPrivateTransaction,
                    operation: "runPrivateMethod"
                });
            }

            if (method.constant || options.callStatic) {

                // Call (constant functions) always cost 0 ether
                if (options.estimate) {
                    return Promise.resolve(Zero);
                }

                if (!contract.provider && !contract.signer) {
                    errors.throwError("call (constant functions) require a provider or signer", errors.UNSUPPORTED_OPERATION, { operation: "call" })
                }

                // Check overrides make sense
                ["gasLimit", "gasPrice", "value"].forEach(function(key) {
                    if (tx[key] != null) {
                        throw new Error("call cannot override " + key) ;
                    }
                });

                if (options.transaction) { return resolveProperties(tx); }

                // FIXME remove once Pantheon 1.3 supports an equivalent of eth_call
                if (!contract.signer) {
                    errors.throwError("can only call a private transaction by sending a signed transaction", errors.UNSUPPORTED_OPERATION, {
                        transaction: tx,
                        operation: "call"
                    });
                }

                //return (contract.signer || contract.provider).privateCall(tx).then((value: any) => {
                return (contract.signer).privateCall(tx).then((value: any) => {

                    if (value == undefined) {
                        errors.throwArgumentError('no value returned from private contract call', 'privateCallValue', {
                            value,
                            functionName,
                            contractAddress: contract.address,
                            params,
                        })
                    }

                    try {
                        let result = contract.interface.decodeFunctionResult(method, value);
                        if (method.outputs.length === 1) {
                            result = result[0];
                        }
                        return result;

                    } catch (error) {
                        if (error.code === errors.CALL_EXCEPTION) {
                            error.address = contract.address;
                            error.args = params;
                            error.transaction = tx;
                        }
                        throw error;
                    }
                });
            }

            // Only computing the transaction estimate
            if (options.estimate) {
                if (!contract.provider && !contract.signer) {
                    errors.throwError("estimate require a provider or signer", errors.UNSUPPORTED_OPERATION, { operation: "estimateGas" })
                }

                // FIXME restore once Pantheon 1.3 supports an equivalent of eth_estimateGas
                errors.throwError("can not currently estimate a private transaction", errors.UNSUPPORTED_OPERATION, { operation: "estimateGas" })
                //return (contract.signer || contract.provider).estimateGas(tx);
            }

            if (tx.gasLimit == null && method.gas != null) {
                tx.gasLimit = BigNumber.from(method.gas).add(21000);
            }

            if (tx.value != null && !method.payable) {
                errors.throwError("contract method is not payable", errors.INVALID_ARGUMENT, {
                    argument: "sendPrivateTransaction",
                    value: tx,
                    method: method.format()
                })
            }

            if (options.transaction) { return resolveProperties(tx); }

            if (!contract.signer) {
                errors.throwError("sending a private transaction require a signer", errors.UNSUPPORTED_OPERATION, { operation: "sendPrivateTransaction" })
            }

            return contract.signer.sendPrivateTransaction(tx).then((tx: PrivateTransactionResponse) => {
                let wait = tx.wait.bind(tx);

                tx.wait = (confirmations?: number) => {
                    return wait(confirmations).then((receipt: PrivateContractReceipt) => {
                        receipt.events = receipt.logs.map((log) => {
                            let event: PrivateEvent = (<PrivateEvent>deepCopy(log));

                            let parsed = contract.interface.parseLog(log);
                            if (parsed) {
                                event.values = parsed.values;
                                event.decode = (data: BytesLike, topics?: Array<any>) => {
                                    return this.interface.decodeEventLog(parsed.eventFragment, data, topics);
                                };
                                event.event = parsed.name;
                                event.eventSignature = parsed.signature;
                            }

                            event.removeListener = () => { return contract.provider; }
                            event.getPrivateTransaction = () => {
                                return contract.provider.getPrivateTransaction(tx.publicHash);
                            }
                            event.getPrivateTransactionReceipt = () => {
                                return Promise.resolve(receipt);
                            }

                            return event;
                        });

                        return receipt;
                    });
                };

                return tx;
            });
        });
    }
}

// TODO Raise Ether.js issue to have this exported from @ethersproject/contracts
// Recursively replaces ENS names with promises to resolve the name and resolves all properties
function resolveAddresses(signerOrProvider: Signer | Provider, value: any, paramType: ParamType | Array<ParamType>): Promise<any> {
    if (Array.isArray(paramType)) {
        return Promise.all(paramType.map((paramType, index) => {
            return resolveAddresses(
                signerOrProvider,
                ((Array.isArray(value)) ? value[index]: value[paramType.name]),
                paramType
            );
        }));
    }

    if (paramType.type === "address") {
        return signerOrProvider.resolveName(value);
    }

    if (paramType.type === "tuple") {
        return resolveAddresses(signerOrProvider, value, paramType.components);
    }

    if (paramType.baseType === "array") {
        if (!Array.isArray(value)) { throw new Error("invalid value for array"); }
        return Promise.all(value.map((v) => resolveAddresses(signerOrProvider, v, paramType.arrayChildren)));
    }

    return Promise.resolve(value);
}

export class PrivateContractFactory extends ContractFactory {

    readonly signer: PrivateJsonRpcSigner;

    constructor(contractInterface: ContractInterface, bytecode: BytesLike | { object: string }, signer?: PrivateWallet) {

        super(contractInterface, bytecode, signer);
    }

    privateDeploy(privacyGroupOptions: PrivacyGroupOptions, ...args: Array<any>): Promise<PrivateContract> {
        return resolveAddresses(this.signer, args, this.interface.deploy.inputs).then((args) => {

            // Get the deployment transaction (with optional overrides)
            const tx = this.getDeployTransaction(...args);

            const privateTx = {
                ...tx,
                ...privacyGroupOptions,
            }

            // Send the deployment transaction
            return this.signer.sendPrivateTransaction(privateTx).then(deployedTx => {

                const address = (<any>(this.constructor)).getPrivateContractAddress(deployedTx);
                const contract = (<any>(this.constructor)).getPrivateContract(address, this.interface, this.signer);

                defineReadOnly(contract, "deployPrivateTransaction", deployedTx);

                return contract;
            });
        });
    }

    static getPrivateContract(
        address: string, contractInterface: ContractInterface,
        signer?: PrivateJsonRpcSigner,
    ): PrivateContract {
        return new PrivateContract(address, contractInterface, signer);
    }

    static getPrivateContractAddress(
        transaction: { from: string, nonce: BigNumberish, privateFor: string, privateFrom: string },
    ): string {
        let from: string = null;
        try {
            from = getAddress(transaction.from);
        } catch (error) {
            errors.throwArgumentError("missing from address", "transaction", transaction);
        }

        let nonce = stripZeros(arrayify(transaction.nonce));

        // convert from object with privateFrom and privateFor properties to base64 from
        const privacyGroupId = generatePrivacyGroup(transaction)
        // convert from base64 to hex
        const privacyGroupIdHex = Buffer.from(privacyGroupId, 'base64');

        return getAddress(hexDataSlice(keccak256(encode([ from, nonce, privacyGroupIdHex ])), 12));
    }
}
