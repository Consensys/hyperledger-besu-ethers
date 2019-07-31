
import { ParamType } from "@ethersproject/abi";
import { Signer } from "@ethersproject/abstract-signer";
import { Block, BlockTag, Log, Provider } from "@ethersproject/abstract-provider";
import { Contract, ContractFactory, ContractInterface } from '@ethersproject/contracts'
import { BigNumber } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";
import { Zero } from "@ethersproject/constants";
import * as errors from "@ethersproject/errors";
import { defineReadOnly, deepCopy, resolveProperties, shallowCopy } from "@ethersproject/properties";

import { EeaJsonRpcProvider, EeaJsonRpcSigner } from './eeaProvider'
import { allowedTransactionKeys, EeaTransactionReceipt, EeaTransactionResponse } from './eeaTransaction'
import { PrivacyGroupOptions } from './privacyGroup'
import { EeaWallet } from './eeaWallet'

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
    getPrivateTransaction: () => Promise<EeaTransactionResponse>;
    getPrivateTransactionReceipt: () => Promise<EeaTransactionReceipt>;
}

export interface PrivateContractReceipt extends EeaTransactionReceipt {
    events?: Array<PrivateEvent>;
}

export class EeaContract extends Contract {

    readonly signer: EeaJsonRpcSigner;
    readonly provider: EeaJsonRpcProvider;
    readonly privacyGroupId: string;
    readonly deployPrivateTransaction: EeaTransactionResponse;

    constructor(
        addressOrName: string,
        contractInterface: ContractInterface,
        signerOrProvider: EeaJsonRpcSigner | EeaJsonRpcProvider)
    {
        super(addressOrName, contractInterface, signerOrProvider);

        Object.keys(this.interface.functions).forEach((name: any) => {
            const run = runPrivateMethod(this, name, {});

            if (this[name] == null) {
                defineReadOnly(this, name, run);
            }

            if (this.functions[name] == null) {
                defineReadOnly(this.functions, name, run);
            }

            if (this.callStatic[name] == null) {
                defineReadOnly(this.callStatic, name, runPrivateMethod(this, name, {callStatic: true}));
            }

            if (this.populateTransaction[name] == null) {
                defineReadOnly(this.populateTransaction, name, runPrivateMethod(this, name, {transaction: true}));
            }

            if (this.estimate[name] == null) {
                defineReadOnly(this.estimate, name, runPrivateMethod(this, name, {estimate: true}));
            }
        });
    }
}

function runPrivateMethod(contract: EeaContract, functionName: string, options: RunOptions): RunFunction {
    let method = contract.interface.functions[functionName];
    return function(...params): Promise<any> {
        let tx: any = {}

        let blockTag: BlockTag = null;

        // If 1 extra parameter was passed in, it contains overrides
        if (params.length === method.inputs.length + 1 && typeof(params[params.length - 1]) === "object") {
            tx = shallowCopy(params.pop());

            if (tx.blockTag != null) {
                blockTag = tx.blockTag;
            }

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

        // If the contract was just deployed, wait until it is minded
        if (contract.deployPrivateTransaction != null) {
            tx.to = contract._deployed(blockTag).then(() => {
                return contract.addressPromise;
            });
        } else {
            tx.to = contract.addressPromise;
        }

        return resolveAddresses(contract.signer || contract.provider, params, method.inputs).then((params) => {
            tx.data = contract.interface.encodeFunctionData(method, params);
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

                return (contract.signer || contract.provider).call(tx, blockTag).then((value) => {

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

                return (contract.signer || contract.provider).estimateGas(tx);
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

            return contract.signer.sendPrivateTransaction(tx).then((tx: EeaTransactionResponse) => {
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

    readonly signer: EeaJsonRpcSigner;

    constructor(contractInterface: ContractInterface, bytecode: BytesLike | { object: string }, signer?: EeaWallet) {

        super(contractInterface, bytecode, signer);
    }

    privateDeploy(privacyGroupOptions: PrivacyGroupOptions, ...args: Array<any>): Promise<EeaContract> {
        return resolveAddresses(this.signer, args, this.interface.deploy.inputs).then((args) => {

            // Get the deployment transaction (with optional overrides)
            const tx = this.getDeployTransaction(...args);

            const privateTx = {
                ...tx,
                ...privacyGroupOptions,
            }

            // Send the deployment transaction
            return this.signer.sendPrivateTransaction(privateTx).then((tx) => {

                const address = (<any>(this.constructor)).getContractAddress(tx);
                const contract = (<any>(this.constructor)).getPrivateContract(address, this.interface, this.signer);

                defineReadOnly(contract, "deployPrivateTransaction", tx);

                return contract;
            });
        });
    }

    static getPrivateContract(address: string, contractInterface: ContractInterface, signer?: EeaJsonRpcSigner): EeaContract {
        return new EeaContract(address, contractInterface, signer);
    }
}
