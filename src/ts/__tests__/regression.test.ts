import { readFileSync } from 'fs'

import { ContractFactory, Wallet, providers } from '../index'
import { ethereumAddress, transactionHash } from '../utils/RegEx'

const url = "http://localhost:20000";
const provider = new providers.JsonRpcProvider(url);
provider.on('debug', (info) => {
    console.log(`Sent "${info.action}" action with request: ${JSON.stringify(info.request)}\nResponse: ${info.response}`);
})

describe('Ethers Regression', () => {

    const noEtherWallet = new Wallet('0x1000000000000000000000000000000000000000000000000000000000000000')
    // const etherWallet = new EeaWallet('0x0000000000000000000000000000000000000000000000000000000000000001')

    describe('account', () => {

        test('ether balances', async() => {
            const nonFundedBalance = await provider.getBalance(noEtherWallet.address)
            expect(nonFundedBalance.toNumber()).toEqual(0)

            // const fundedBalance = await eeaProvider.getBalance(etherWallet.address)
            // expect(fundedBalance.toNumber()).toBeGreaterThan(0)
        })
    })

    describe('Ether', () => {

        // send ether
            // get transaction receipt
            // get an ether transfer event
    })

    describe('Simple contract', () => {

        const contractWallet = new Wallet('0x0000000000000000000000000000000000000000000000000000000000000002', provider)

        test('deploy test contract', async() => {

            const testContractAbi = readFileSync('./src/abis/TestContract.abi', 'utf8')
            const bytecode = readFileSync('./src/abis/TestContract.bin', 'utf8')

            const factory = new ContractFactory(testContractAbi, bytecode, contractWallet);

            let contract = await factory.deploy();

            expect(contract.address).toMatch(ethereumAddress)
            expect(contract.deployTransaction.hash).toMatch(transactionHash)

            const txReceipt = await contract.deployTransaction.wait()

            expect(txReceipt.status).toEqual(1)

        }, 30000)

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
