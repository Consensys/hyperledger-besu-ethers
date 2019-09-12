
import { readFileSync } from 'fs'

import {PrivateContractFactory, PrivateWallet, providers, utils, PrivacyGroupOptions, PrivateContract} from '../index'

jest.setTimeout(20000)

const urlNode1 = "http://localhost:20000";
const providerNode1 = new providers.PrivateJsonRpcProvider(urlNode1);
providerNode1.on('debug', (info) => {
    console.log(`Sent "${info.action}" action to node 1 with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

const urlNode2 = "http://localhost:20002";
const providerNode2 = new providers.PrivateJsonRpcProvider(urlNode2);
providerNode2.on('debug', (info) => {
    console.log(`Sent "${info.action}" action to node 2 with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

const urlNode3 = "http://localhost:20004";
const providerNode3 = new providers.PrivateJsonRpcProvider(urlNode3);
providerNode3.on('debug', (info) => {
    console.log(`Sent "${info.action}" action to node 3 with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

const node1 = 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo='
const node1Address = '0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73'
const node2 = 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='
// const node3 = 'k2zXEin4Ip/qBGlRkJejnGWdP9cjkK+DAvKNW31L2C8='

const preCompiledContract = '0x000000000000000000000000000000000000007E'

describe('Deploy contract using contract factory', () => {

    let walletNode1: PrivateWallet
    let walletNode2: PrivateWallet
    let txHash: string
    let signerAddress: string

    beforeAll(async () => {
        // 0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF
        const privateKey = '0x0000000000000000000000000000000000000000000000000000000000000002'
        walletNode1 = new PrivateWallet(privateKey, providerNode1)
        walletNode2 = new PrivateWallet(privateKey, providerNode2)
        signerAddress = await walletNode1.getAddress()

        console.log(`Private transaction signer address ${signerAddress}`)
    })

    describe('Create privacy group before creating the contract', () => {

        let privacyGroupId: string
        let privacyGroupOptions: PrivacyGroupOptions
        let privateTxCountNode1: number
        let contractNode1: PrivateContract
        let contractNode2: PrivateContract

        let testContractAbi: string
        let bytecode: string

        beforeAll(() => {
            testContractAbi = readFileSync('./dist/abis/TestContract.abi', 'utf8')
            bytecode = readFileSync('./dist/abis/TestContract.bin', 'utf8')
        })

        test('Create privacy group', async () => {

            privacyGroupId = await providerNode1.createPrivacyGroup(
                [node1, node2],
                'Top Secret',
                'Super secret group')
            expect(privacyGroupId).toMatch(utils.RegEx.base64)
            expect(privacyGroupId).toHaveLength(44)

            privacyGroupOptions = {
                privateFor: privacyGroupId,
                restriction: 'restricted',
            }
        })

        test('Check privacy group was created', async() => {
            const privacyGroups = await providerNode1.findPrivacyGroup(
                [node1, node2]
            )
            expect(privacyGroups).toHaveLength(1)
        })

        test('Get private transaction count before deploy', async() => {
            privateTxCountNode1 = await providerNode1.getPrivateTransactionCount(node1Address, privacyGroupOptions)
            expect(privateTxCountNode1).toBeGreaterThanOrEqual(0)
        })

        test('deploy test contract', async() => {

            const factory = new PrivateContractFactory(testContractAbi, bytecode, walletNode1);

            contractNode1 = await factory.privateDeploy(privacyGroupOptions);

            expect(contractNode1.address).toMatch(utils.RegEx.ethereumAddress)
            expect(contractNode1.deployPrivateTransaction.publicHash).toMatch(utils.RegEx.transactionHash)
            txHash = contractNode1.deployPrivateTransaction.publicHash

            const txReceipt = await contractNode1.deployPrivateTransaction.wait()

            expect(txReceipt.contractAddress).toEqual(contractNode1.address)
            expect(txReceipt.to).toBeNull()
            expect(txReceipt.from).toEqual(signerAddress)
            expect(txReceipt.logs).toEqual([])
        })

        test('get private transaction receipt', async() => {
            const txReceipt = await providerNode1.getPrivateTransactionReceipt(txHash)

            expect(txReceipt.to).toBeNull()
            expect(txReceipt.from).toEqual(signerAddress)
            expect(txReceipt.logs).toEqual([])
            expect(txReceipt.contractAddress).toEqual(contractNode1.address)
        })

        test('get public marker transaction receipt', async() => {
            const txReceipt = await providerNode1.getTransactionReceipt(txHash)
            expect(txReceipt.status).toEqual(1)
            expect(txReceipt.from).not.toEqual(node1Address)
            expect(txReceipt.from).toMatch(utils.RegEx.ethereumAddress)
            expect(txReceipt.to).toEqual(preCompiledContract)
            expect(txReceipt.logs).toEqual([])
            expect(txReceipt.contractAddress).toBeNull()
        })

        test('Get private transaction count after deploy', async() => {
            const count = await providerNode1.getPrivateTransactionCount(
                signerAddress,
                privacyGroupOptions)
            expect(count).toEqual(privateTxCountNode1 + 1)
        })

        describe('call contract', () => {
            test('pure function', async() => {
                const value = await contractNode1.getMagicNumber()
                expect(value.eq(99999)).toBeTruthy()
            })

            test('view function', async() => {
                const value = await contractNode1.getTestUint()
                expect(value.eq(1)).toBeTruthy()
            })

            test('public property', async() => {
                const value = await contractNode1.testString()
                expect(value).toEqual('test string')
            })

            // test('pure function that fails', async() => {
            //     expect.assertions(1)
            //
            //     try {
            //         const result = await contract.pureFail()
            //         console.log(result)
            //         expect(false).toBeTruthy()
            //     }
            //     catch (err) {
            //         expect(err).toBeInstanceOf(Error)
            //     }
            // })
            //
            // test('view function that fails', async() => {
            //     expect.assertions(1)
            //
            //     try {
            //         const result = await contract.viewFail()
            //         console.log(result)
            //         expect(false).toBeTruthy()
            //     }
            //     catch (err) {
            //         expect(err).toBeInstanceOf(Error)
            //     }
            // })
        })

        describe('send transaction', () => {
            test('to write data', async() => {
                const tx = await contractNode1.setTestUint(2)
                expect(tx.publicHash).toMatch(utils.RegEx.bytes32)
                expect(tx.to).toEqual(contractNode1.address)
                expect(tx.from).toEqual(signerAddress)

                const receipt = await providerNode1.waitForTransaction(tx.publicHash)
                expect(receipt.status).toEqual(1)
            })

            test('to write data with gasLimit', async() => {
                const tx = await contractNode1.setTestUint(3, {
                    gasLimit: 100000
                })
                expect(tx.publicHash).toMatch(utils.RegEx.bytes32)
                expect(tx.to).toEqual(contractNode1.address)
                expect(tx.from).toEqual(signerAddress)

                const receipt = await providerNode1.waitForTransaction(tx.publicHash)
                expect(receipt.status).toEqual(1)
            })

            test('that will fail from tx function', async() => {
                const tx = await contractNode1.txFail()
                expect(tx.publicHash).toMatch(utils.RegEx.bytes32)
                expect(tx.to).toEqual(contractNode1.address)
                expect(tx.from).toEqual(signerAddress)

                const receipt = await providerNode1.waitForTransaction(tx.publicHash)
                expect(receipt.status).toEqual(0)
            })
        })

        describe('node 2 interacts to existing contract deployed from node 1 using', () => {
            describe('contract connect function', () => {
                test('instantiate contract', async() => {
                    contractNode2 = new PrivateContract(contractNode1.address, privacyGroupOptions, testContractAbi, providerNode2)
                    contractNode2 = contractNode1.connect(walletNode2)
                    expect(contractNode2.address).toEqual(contractNode1.address)
                })

                test('read data', async() => {
                    const value = await contractNode2.getTestUint()
                    expect(value.eq(3)).toBeTruthy()
                })

                test('write data', async() => {
                    const tx = await contractNode2.setTestUint(4)
                    expect(tx.publicHash).toMatch(utils.RegEx.bytes32)
                    expect(tx.to).toEqual(contractNode1.address)
                    expect(tx.from).toEqual(signerAddress)

                    const receipt = await providerNode2.waitForTransaction(tx.publicHash)
                    expect(receipt.status).toEqual(1)
                })
            })

            describe('contract constructor', () => {
                test('instantiate contract', async() => {
                    contractNode2 = new PrivateContract(contractNode1.address, privacyGroupOptions, testContractAbi, walletNode2)
                    expect(contractNode2.address).toEqual(contractNode1.address)
                })

                test('read data', async() => {
                    const value = await contractNode2.getTestUint()
                    expect(value.eq(4)).toBeTruthy()
                })

                test('write data', async() => {
                    const tx = await contractNode2.setTestUint(4)
                    expect(tx.publicHash).toMatch(utils.RegEx.bytes32)
                    expect(tx.to).toEqual(contractNode1.address)
                    expect(tx.from).toEqual(signerAddress)

                    const receipt = await providerNode2.waitForTransaction(tx.publicHash)
                    expect(receipt.status).toEqual(1)
                })
            })
        })

        test('Delete privacy group', async() => {
            const result = await providerNode1.deletePrivacyGroup(privacyGroupId)
            expect(result).toEqual(privacyGroupId)
        })
    })

    // describe('Using privateFrom and privateFor', () => {
    //
    //     const privacyGroupOptions = {
    //         privateFrom: node1,
    //         privateFor: [node1, node2, node3]
    //     }
    //
    //     test('Get transaction count before deploy', async() => {
    //         const privateTxCount = await providerNode1.getPrivateTransactionCount(node1Address, privacyGroupOptions)
    //         expect(privateTxCount).toBeGreaterThanOrEqual(0)
    //     })
    //
    //     test('deploy test contract', async() => {
    //
    //         const testContractAbi = readFileSync('./dist/abis/TestContract.abi', 'utf8')
    //         const bytecode = readFileSync('./dist/abis/TestContract.bin', 'utf8')
    //
    //         const factory = new PrivateContractFactory(testContractAbi, bytecode, node1Wallet);
    //
    //         let contract = await factory.privateDeploy(privacyGroupOptions);
    //
    //         expect(contract.address).toMatch(utils.RegEx.ethereumAddress)
    //         expect(contract.deployTransaction.hash).toMatch(utils.RegEx.transactionHash)
    //
    //         const txReceipt = await contract.deployTransaction.wait()
    //
    //         expect(txReceipt.status).toEqual(1)
    //         expect(txReceipt.contractAddress).toMatch(utils.RegEx.ethereumAddress)
    //         contractAddress = txReceipt.contractAddress
    //
    //         privateTxHash = txReceipt.transactionHash
    //
    //     }, 30000)
    //
    //     test('get transaction receipt', async() => {
    //         const txReceipt = await providerNode1.getPrivateTransactionReceipt(privateTxHash)
    //         expect(txReceipt.transactionHash).toEqual(privateTxHash)
    //         expect(txReceipt.contractAddress).toEqual(contractAddress)
    //     })
    //
    //
    //     test('Check privacy group was created', async() => {
    //         const privacyGroups = await providerNode1.findPrivacyGroup(
    //             [node1, node2, node3]
    //         )
    //         expect(privacyGroups).toHaveLength(1)
    //     })
    // })

})
