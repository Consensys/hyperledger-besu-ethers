
import { readFileSync } from 'fs'

import {PrivateContractFactory, EeaWallet, providers, utils, PrivacyGroupOptions} from '../index'

jest.setTimeout(15000)

const urlNode1 = "http://localhost:20000";
const providerNode1 = new providers.EeaJsonRpcProvider(urlNode1);
providerNode1.on('debug', (info) => {
    console.log(`Sent "${info.action}" action to node 1 with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

const urlNode2 = "http://localhost:20002";
const providerNode2 = new providers.EeaJsonRpcProvider(urlNode2);
providerNode2.on('debug', (info) => {
    console.log(`Sent "${info.action}" action to node 2 with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

const urlNode3 = "http://localhost:20004";
const providerNode3 = new providers.EeaJsonRpcProvider(urlNode3);
providerNode3.on('debug', (info) => {
    console.log(`Sent "${info.action}" action to node 3 with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

const node1 = 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo='
const node2 = 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='
// const node3 = 'k2zXEin4Ip/qBGlRkJejnGWdP9cjkK+DAvKNW31L2C8='

const preCompiledContract = '0x000000000000000000000000000000000000007E'

describe('Deploy contract using contract factory', () => {

    let node1Address: string
    let node1Wallet: EeaWallet
    let contractAddress: string
    let txHash: string

    const signerAddress = '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF'

    beforeAll(async () => {
        // 0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF
        const privateKey = '0x0000000000000000000000000000000000000000000000000000000000000002'
        node1Wallet = new EeaWallet(privateKey, providerNode1)
        console.log(`Signer address ${await node1Wallet.getAddress()}`)
    })

    test('get public key for node 1', async() => {
        const result = await providerNode1.getNodeInfo()
        expect(result.id).toHaveLength(128)

        node1Address = '0x' + result.id.substring(88)
        console.log(`Node 1 signer address ${node1Address}\nNode id: ${result.id}`)
    })

    describe('Create privacy group before creating the contract', () => {

        let privacyGroupId: string
        let privacyGroupOptions: PrivacyGroupOptions
        let privateTxCountNode1: number

        test('Create privacy group', async () => {

            privacyGroupId = await providerNode1.createPrivacyGroup(
                [node1, node2],
                'Top Secret',
                'Super secret group')
            expect(privacyGroupId).toMatch(utils.RegEx.base64)
            expect(privacyGroupId).toHaveLength(44)

            privacyGroupOptions = {
                privateFor: privacyGroupId
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

            const testContractAbi = readFileSync('./src/abis/TestContract.abi', 'utf8')
            const bytecode = readFileSync('./src/abis/TestContract.bin', 'utf8')

            const factory = new PrivateContractFactory(testContractAbi, bytecode, node1Wallet);

            let contract = await factory.privateDeploy(privacyGroupOptions);

            expect(contract.address).toMatch(utils.RegEx.ethereumAddress)
            expect(contract.deployPrivateTransaction.publicHash).toMatch(utils.RegEx.transactionHash)
            txHash = contract.deployPrivateTransaction.publicHash

            const txReceipt = await contract.deployPrivateTransaction.wait()

            expect(txReceipt.to).toBeNull()
            expect(txReceipt.from).toEqual(signerAddress)
            expect(txReceipt.logs).toEqual([])
            expect(txReceipt.contractAddress).toMatch(utils.RegEx.ethereumAddress)

            contractAddress = txReceipt.contractAddress
        })

        test('get private transaction receipt', async() => {
            const txReceipt = await providerNode1.getPrivateTransactionReceipt(txHash)
            expect(txReceipt.to).toBeNull()
            expect(txReceipt.from).toEqual(signerAddress)
            expect(txReceipt.logs).toEqual([])
            expect(txReceipt.contractAddress).toEqual(contractAddress)
        })

        test('get public marker transaction receipt', async() => {
            const txReceipt = await providerNode1.getTransactionReceipt(txHash)
            expect(txReceipt.status).toEqual(1)
            expect(txReceipt.from).toEqual(node1Address)
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
    //         const testContractAbi = readFileSync('./src/abis/TestContract.abi', 'utf8')
    //         const bytecode = readFileSync('./src/abis/TestContract.bin', 'utf8')
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
