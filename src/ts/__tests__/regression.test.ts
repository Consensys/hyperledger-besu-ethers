import { readFileSync } from 'fs'

import { Contract, ContractFactory, Wallet, providers } from '../index'
// import { Contract, ContractFactory, Wallet, providers } from 'ethers'   // version 5
// import { Contract, ContractFactory, Wallet, providers } from 'ethers-4'
import { ethereumAddress, transactionHash } from '../utils/RegEx'

const url = "http://localhost:20000";
// const url = "http://localhost:8646";
const provider = new providers.JsonRpcProvider(url);
provider.on('debug', (info) => {
    console.log(`Sent "${info.action}" action with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

const testContractAbi = readFileSync('./dist/abis/TestContract.abi', 'utf8')
const bytecode = readFileSync('./dist/abis/TestContract.bin', 'utf8')

describe('Ethers Regression', () => {

    const noEtherWallet = new Wallet('0x1000000000000000000000000000000000000000000000000000000000000000')
    // one of the three pre-funded dev accounts
    // https://github.com/hyperledger/besu/blob/master/config/src/main/resources/dev.json
    const etherWallet = new Wallet('0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63')

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
            expect(txReceipt.contractAddress).toEqual(contract.address)
            // expect(txReceipt.to).toBeNull()
        })

        test('get transaction', async () => {
            const tx = await provider.getTransaction(txHash)
            expect(tx.hash).toEqual(txHash)
            expect(tx.from).toEqual(await contractWallet.getAddress())
            expect(tx.data).toEqual(contract.deployTransaction.data)
            // expect(tx.to).toEqual(contract.address)
        })

        describe('call contract', () => {
            test('pure function', async() => {
                const value = await contract.getMagicNumber()
                expect(value.eq(99999)).toBeTruthy()
            })

            test('view function', async() => {
                const value = await contract.getTestUint()
                expect(value.eq(1)).toBeTruthy()
            })

            test('public property', async() => {
                const value = await contract.testString()
                expect(value).toEqual('test string')
            })

            test('pure function that fails', async() => {
                expect.assertions(1)

                try {
                    const result = await contract.pureFail()
                    console.log(result)
                    expect(false).toBeTruthy()
                }
                catch (err) {
                    expect(err).toBeInstanceOf(Error)
                }
            })

            test('view function that fails', async() => {
                expect.assertions(1)

                try {
                    const result = await contract.viewFail()
                    console.log(result)
                    expect(false).toBeTruthy()
                }
                catch (err) {
                    expect(err).toBeInstanceOf(Error)
                }
            })
        })

        describe('send transaction', () => {
            test('to write data', async() => {
                const tx = await contract.setTestUint(2)
                expect(tx.hash).toMatch(transactionHash)
                expect(tx.to).toEqual(contract.address)
                expect(tx.from).toEqual(await contractWallet.getAddress())

                await tx.wait()

                const value = await contract.getTestUint()
                expect(value.eq(2)).toBeTruthy()
            })

            test('to write data with gasLimit', async() => {
                const tx = await contract.setTestUint(3, {
                    gasLimit: 100000
                })
                expect(tx.hash).toMatch(transactionHash)
                expect(tx.to).toEqual(contract.address)
                expect(tx.from).toEqual(await contractWallet.getAddress())

                await provider.waitForTransaction(tx.hash)

                const value = await contract.getTestUint()
                expect(value.eq(3)).toBeTruthy()
            })

            test('that will fail from tx function', async() => {
                const tx = await contract.txFail()
                expect(tx.hash).toMatch(transactionHash)

                const receipt = await provider.waitForTransaction(tx.hash)
                expect(receipt.status).toEqual(0)
            })
        })

        // get an event

        describe('Connect to an existing contract from node 2', () => {
            let providerNode2: any
            let existingContract: Contract

            test('instantiate', () => {
                providerNode2 = new providers.JsonRpcProvider("http://localhost:20000");
                const walletNode2 = new Wallet('0x0000000000000000000000000000000000000000000000000000000000000002', providerNode2)
                existingContract = new Contract(contract.address, testContractAbi, walletNode2)
            })

            test('write data to contract', async() => {
                const tx = await existingContract.setTestUint(4)
                expect(tx.hash).toMatch(transactionHash)
                expect(tx.to).toEqual(contract.address)
                expect(tx.from).toEqual(await contractWallet.getAddress())

                await tx.wait()
            })

            test('read data back from contract', async() => {
                const value = await existingContract.getTestUint()
                expect(value.eq(4)).toBeTruthy()
            })
        })
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
