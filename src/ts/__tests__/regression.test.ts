import { readFileSync } from 'fs'

import { Contract, ContractFactory, Wallet, providers } from '../index'
import { ethereumAddress, transactionHash } from '../utils/RegEx'

const url = "http://localhost:20000";
// const url = "http://localhost:8646";
const provider = new providers.JsonRpcProvider(url);
provider.on('debug', (info) => {
    console.log(`Sent "${info.action}" action with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

describe('Ethers Regression', () => {

    const noEtherWallet = new Wallet('0x1000000000000000000000000000000000000000000000000000000000000000')
    const etherWallet = new Wallet('0x0000000000000000000000000000000000000000000000000000000000000001')

    describe('account', () => {

        test('ether balances', async() => {
            const nonFundedBalance = await provider.getBalance(noEtherWallet.address)
            expect(nonFundedBalance.toNumber()).toEqual(0)

            const fundedBalance = await provider.getBalance(etherWallet.address)
            expect(fundedBalance.gt(0)).toBeTruthy()
        })
    })

    describe('Ether', () => {

        // send ether
            // get transaction receipt
            // get an ether transfer event
    })

    describe('Simple contract', () => {

        // 0x2b5ad5c4795c026514f8317c7a215e218dccd6cf
        const contractWallet = new Wallet('0x0000000000000000000000000000000000000000000000000000000000000002', provider)

        let contract: Contract
        let txHash: string

        test('deploy test contract', async() => {

            const testContractAbi = readFileSync('./src/abis/TestContract.abi', 'utf8')
            const bytecode = readFileSync('./src/abis/TestContract.bin', 'utf8')

            const factory = new ContractFactory(testContractAbi, bytecode, contractWallet);

            contract = await factory.deploy();

            expect(contract.address).toMatch(ethereumAddress)
            expect(contract.deployTransaction.hash).toMatch(transactionHash)
            txHash = contract.deployTransaction.hash

            const txReceipt = await contract.deployTransaction.wait()

            expect(txReceipt.status).toEqual(1)

        }, 30000)

        test('get transaction receipt', async () => {
            const txReceipt = await provider.getTransactionReceipt(txHash)
            expect(txReceipt.transactionHash).toEqual(txHash)
            expect(txReceipt.from).toEqual(await contractWallet.getAddress())
            expect(txReceipt.to).toBeUndefined()
            expect(txReceipt.contractAddress).toEqual(contract.address)
        })

        test('get transaction', async () => {
            const tx = await provider.getTransaction(txHash)
            expect(tx.hash).toEqual(txHash)
            expect(tx.from).toEqual(await contractWallet.getAddress())
            expect(tx.data).toEqual(contract.deployTransaction.data)
            // expect(tx.to).toEqual('0x0')
        })

        // call a function
        // send a transaction
        // get an event
    })

    describe('getTransactionReceipt', () => {
        describe('Failed getTransactionReceipt', () => {
            test('missing hash', async () => {
                const result = await provider.getTransactionReceipt('0x0000000000000000000000000000000000000000000000000000000000000001')
                expect(result).toBeNull()
            })
        })
    })
})
