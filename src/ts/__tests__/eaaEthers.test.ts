
import * as eeaEthers from '../index'
import * as RegEx from '../utils/RegEx'
import {keccak256} from 'ethers/utils'

const urlNode1 = "http://localhost:20000";
const providerNode1 = new eeaEthers.providers.EeaJsonRpcProvider(urlNode1);
providerNode1.on('debug', (info) => {
    console.log(`Sent "${info.action}" action to node 1 with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

const urlNode2 = "http://localhost:20002";
const providerNode2 = new eeaEthers.providers.EeaJsonRpcProvider(urlNode2);
providerNode2.on('debug', (info) => {
    console.log(`Sent "${info.action}" action to node 2 with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

const urlNode3 = "http://localhost:20004";
const providerNode3 = new eeaEthers.providers.EeaJsonRpcProvider(urlNode3);
providerNode3.on('debug', (info) => {
    console.log(`Sent "${info.action}" action to node 3 with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

const node1 = 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo='
const node2 = 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='
// const node3 = 'k2zXEin4Ip/qBGlRkJejnGWdP9cjkK+DAvKNW31L2C8='

describe('EEA Ethers', () => {

    test('Check overridden functions have been exported', ()=> {
        expect(eeaEthers).toBeDefined()
        expect(eeaEthers.utils).toBeDefined()
        expect(eeaEthers.utils.serialize).toBeInstanceOf(Function)
        expect(eeaEthers.utils.encode).toBeInstanceOf(Function)
        expect(eeaEthers.providers.EeaJsonRpcSigner).toBeInstanceOf(Function)
        expect(eeaEthers.providers.EeaJsonRpcProvider).toBeInstanceOf(Function)
    })

    test('signed transaction matches EEA client', async() => {

        // fe3b557e8fb62b89f4916b721be55ceb828dbd73
        const privateKey = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63'
        let wallet = new eeaEthers.EeaWallet(privateKey)

        // deploy a contract
        const unsignedTransaction = {
            nonce: 0,
            gasPrice: 0,
            gasLimit: 3000000,
            // to: undefined,
            value: 0,
            data: '0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610221806100606000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633fa4f2451461005c5780636057361d1461008757806367e404ce146100b4575b600080fd5b34801561006857600080fd5b5061007161010b565b6040518082815260200191505060405180910390f35b34801561009357600080fd5b506100b260048036038101908080359060200190929190505050610115565b005b3480156100c057600080fd5b506100c96101cb565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6000600254905090565b7fc9db20adedc6cf2b5d25252b101ab03e124902a73fcb12b753f3d1aaa2d8f9f53382604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a18060028190555033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050905600a165627a7a723058208efaf938851fb2d235f8bf9a9685f149129a30fe0f4b20a6c1885dc02f639eba0029',
            chainId: 2018,
            privateFrom: node1,
            privateFor: [node2],
            restriction: 'restricted',
        }

        // From web3js-eea eventEmitter example BEFORE fixing base64 encoding of the privateFrom and privateFor fields.
        // const eeaSignedRlpEncoded = '0xf903378080832dc6c08080b90281608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610221806100606000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633fa4f2451461005c5780636057361d1461008757806367e404ce146100b4575b600080fd5b34801561006857600080fd5b5061007161010b565b6040518082815260200191505060405180910390f35b34801561009357600080fd5b506100b260048036038101908080359060200190929190505050610115565b005b3480156100c057600080fd5b506100c96101cb565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6000600254905090565b7fc9db20adedc6cf2b5d25252b101ab03e124902a73fcb12b753f3d1aaa2d8f9f53382604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a18060028190555033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050905600a165627a7a723058208efaf938851fb2d235f8bf9a9685f149129a30fe0f4b20a6c1885dc02f639eba0029820fe8a0c6ed0b2b08e0e65bdda3a239e546e215e62dd15086d3b2c3fc1d6996d47a71bea065b30e766ab58eca8dd758d9e05cf2d98536c68b9ab1607bc2a1d7ef37bd279cac41316156744d784c4355486d425648586f5a7a7a42675062572f776a3561784470573958386c393153476f3dedac4b6f32625671442b6e4e6c4e594c35454537793349644f6e766966746a69697a706a52742b4854754642733d8a72657374726963746564'
        // From web3js-eea eventEmitter example AFTER fixing base64 encoding of the privateFrom and privateFor fields.
        // see https://pegasys1.atlassian.net/browse/PAN-2814
        const eeaSignedRlpEncoded = '0xf9031f8080832dc6c08080b90281608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610221806100606000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633fa4f2451461005c5780636057361d1461008757806367e404ce146100b4575b600080fd5b34801561006857600080fd5b5061007161010b565b6040518082815260200191505060405180910390f35b34801561009357600080fd5b506100b260048036038101908080359060200190929190505050610115565b005b3480156100c057600080fd5b506100c96101cb565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6000600254905090565b7fc9db20adedc6cf2b5d25252b101ab03e124902a73fcb12b753f3d1aaa2d8f9f53382604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a18060028190555033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050905600a165627a7a723058208efaf938851fb2d235f8bf9a9685f149129a30fe0f4b20a6c1885dc02f639eba0029820fe7a0ea2340ef4a0d32e2c44fed9b8d880a38a1ecfbef618ca0234a404c2360719617a063acf2ee8286787f3ebb640da56ded5952c8bdc8d1bf374e2dfe5afdeb79bea8a0035695b4cc4b0941e60551d7a19cf30603db5bfc23e5ac43a56f57f25f75486ae1a02a8d9b56a0fe9cd94d60be4413bcb721d3a7be27ed8e28b3a6346df874ee141b8a72657374726963746564'

        const signedTransaction = await wallet.signTransaction(unsignedTransaction)
        expect(signedTransaction).toEqual(eeaSignedRlpEncoded)

        const parsedTransaction = providerNode1.formatter.transaction(signedTransaction)
        expect(parsedTransaction.nonce).toEqual(unsignedTransaction.nonce)
        expect(parsedTransaction.data).toEqual(unsignedTransaction.data)
    })

    describe('private for only one other party', () => {

        const testParticipants = {
            from: 'fe3b557e8fb62b89f4916b721be55ceb828dbd73',
            privateFrom: node1,
            privateFor: [node2],
        }

        // @ts-ignore
        let eeaWallet: eeaEthers.EeaWallet
        let privateNonce: number
        let publicNonce: number
        let txHash: string

        beforeAll(() => {
            // fe3b557e8fb62b89f4916b721be55ceb828dbd73
            const privateKey = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63'
            eeaWallet = new eeaEthers.EeaWallet(privateKey)
        })

        test('get private transaction count', async () => {
            privateNonce = await providerNode1.getPrivateTransactionCount(testParticipants.from, testParticipants)
            expect(privateNonce).toBeGreaterThanOrEqual(0)
        })

        test('get public transaction count', async () => {
            publicNonce = await providerNode1.getTransactionCount(testParticipants.from)
            expect(publicNonce).toEqual(0)
        })

        test('send signed deploy transaction', async () => {

            // deploy a contract
            const unsignedTransaction = {
                nonce: privateNonce,
                gasPrice: 0,
                gasLimit: 3000000,
                // to: undefined,
                value: 0,
                data: '0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610221806100606000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633fa4f2451461005c5780636057361d1461008757806367e404ce146100b4575b600080fd5b34801561006857600080fd5b5061007161010b565b6040518082815260200191505060405180910390f35b34801561009357600080fd5b506100b260048036038101908080359060200190929190505050610115565b005b3480156100c057600080fd5b506100c96101cb565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6000600254905090565b7fc9db20adedc6cf2b5d25252b101ab03e124902a73fcb12b753f3d1aaa2d8f9f53382604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a18060028190555033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050905600a165627a7a723058208efaf938851fb2d235f8bf9a9685f149129a30fe0f4b20a6c1885dc02f639eba0029',
                chainId: 2018,
                privateFrom: node1,
                privateFor: [node2],
                restriction: 'restricted',
            }

            const signedTransaction = await eeaWallet.signTransaction(unsignedTransaction)

            const tx = await providerNode1.sendPrivateTransaction(signedTransaction)
            expect(tx.hash).toMatch(RegEx.transactionHash)
            txHash = tx.hash

            console.log(`Server tx hash: ${tx.hash}`)
            console.log(`Client tx hash: ${keccak256(signedTransaction)}`)

            // wait for the transaction to be mined
            const txReceipt = await providerNode1.waitForTransaction(tx.hash)
            expect(txReceipt.status).toEqual(1)
            expect(txReceipt.contractAddress).toBeNull()
        }, 30000)

        test('get private transaction counts', async () => {
            const nonceNode1 = await providerNode1.getPrivateTransactionCount(testParticipants.from, testParticipants)
            expect(nonceNode1).toBeGreaterThanOrEqual(privateNonce + 1)

            const nonceNode2 = await providerNode2.getPrivateTransactionCount(testParticipants.from, testParticipants)
            expect(nonceNode2).toBeGreaterThanOrEqual(privateNonce + 1)

            const nonceNode3 = await providerNode3.getPrivateTransactionCount(testParticipants.from, testParticipants)
            expect(nonceNode3).toBeGreaterThanOrEqual(publicNonce)
        })

        test('get public transaction count', async () => {
            const nonceNode1 = await providerNode1.getTransactionCount(testParticipants.from)
            expect(nonceNode1).toBeGreaterThanOrEqual(publicNonce)

            const nonceNode2 = await providerNode2.getTransactionCount(testParticipants.from)
            expect(nonceNode2).toBeGreaterThanOrEqual(publicNonce)

            const nonceNode3 = await providerNode3.getTransactionCount(testParticipants.from)
            expect(nonceNode3).toBeGreaterThanOrEqual(publicNonce)
        })

        test('get public transaction receipts', async () => {
            const txReceiptNode1 = await providerNode1.getTransactionReceipt(txHash)
            expect(txReceiptNode1.status).toEqual(1)
            expect(txReceiptNode1.transactionHash).toEqual(txHash)
            expect(txReceiptNode1.contractAddress).toBeNull()

            const txReceiptNode2 = await providerNode2.getTransactionReceipt(txHash)
            expect(txReceiptNode2.status).toEqual(1)
            expect(txReceiptNode2.transactionHash).toEqual(txHash)
            expect(txReceiptNode2.contractAddress).toBeNull()

            const txReceiptNode3 = await providerNode3.getTransactionReceipt(txHash)
            expect(txReceiptNode3.status).toEqual(1)
            expect(txReceiptNode3.transactionHash).toEqual(txHash)
            expect(txReceiptNode3.contractAddress).toBeNull()
        })

        test('get private transaction receipts', async () => {
            const txReceiptNode1 = await providerNode1.getPrivateTransactionReceipt(txHash)
            expect(txReceiptNode1.contractAddress).toMatch(RegEx.ethereumAddress)
            expect(txReceiptNode1.from).toMatch(RegEx.ethereumAddress)
            expect(txReceiptNode1.to).toBeUndefined()

            const txReceiptNode2 = await providerNode2.getPrivateTransactionReceipt(txHash)
            expect(txReceiptNode2.contractAddress).toMatch(RegEx.ethereumAddress)
            expect(txReceiptNode2.from).toMatch(RegEx.ethereumAddress)
            expect(txReceiptNode2.to).toBeUndefined()

            const txReceiptNode3 = await providerNode3.getPrivateTransactionReceipt(txHash)
            expect(txReceiptNode3).toBeNull()
        }, 15000)
    })

    describe('Deploy contract using contract factory', () => {

        // let eeaWallet: eeaEthers.EeaWallet
        //
        // beforeAll(() => {
        //     // fe3b557e8fb62b89f4916b721be55ceb828dbd73
        //     const privateKey = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63'
        //     eeaWallet = new eeaEthers.EeaWallet(privateKey)
        // })
        //
        // test('deploy test contract', async() => {
        //
        //     const testContractAbi = readFileSync('./src/abis/TestContract.abi', 'utf8')
        //     const bytecode = readFileSync('./src/abis/TestContract.bin', 'utf8')
        //
        //     const factory = new ContractFactory(testContractAbi, bytecode, eeaWallet);
        //
        //     let contract = await factory.deploy();
        //
        //     expect(contract.address).toMatch(ethereumAddress)
        //     expect(contract.deployTransaction.hash).toMatch(transactionHash)
        //
        //     const txReceipt = await contract.deployTransaction.wait()
        //
        //     expect(txReceipt.status).toEqual(1)
        //
        // }, 30000)
    })

})
