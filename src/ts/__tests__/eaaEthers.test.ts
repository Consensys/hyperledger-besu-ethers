
import { keccak256 } from "@ethersproject/keccak256"

import * as eeaEthers from '../index'
import { EeaWallet, providers, EeaTransactionRequest } from '../index'
import * as RegEx from '../utils/RegEx'

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
const node3 = 'k2zXEin4Ip/qBGlRkJejnGWdP9cjkK+DAvKNW31L2C8='
const invalidNode = '00000000000000000000000000000000000000000001'

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
        let wallet = new EeaWallet(privateKey)

        // deploy a contract
        const unsignedTransaction: EeaTransactionRequest = {
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

    describe('getPrivateTransactionReceipt', () => {
        test('missing hash', async () => {
            const result = await providerNode1.getPrivateTransactionReceipt('0x0000000000000000000000000000000000000000000000000000000000000001')
            expect(result).toBeNull()
        })
    })

    describe('privacy group management', () => {

        describe('Create, find and delete', () => {

            let firstPrivacyGroupId: string
            let duplicatePrivacyGroupId: string

            test('no existing privacy groups', async () => {
                const results = await providerNode2.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(0)
            })

            test('Create privacy group', async () => {
                firstPrivacyGroupId = await providerNode2.createPrivacyGroup(
                    node2,
                    'Node2_3',
                    'node2, [node2, node3]',
                    [node2, node3])
                expect(firstPrivacyGroupId).toMatch(RegEx.base64)
                expect(firstPrivacyGroupId).toHaveLength(44)
            })

            test('find privacy group from node2 that created it', async () => {
                const results = await providerNode2.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(1)
            })

            test('find privacy group from node3 that is a member', async () => {
                const results = await providerNode3.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(1)
            })

            test('find privacy group from node1 that is NOT a member', async () => {
                const results = await providerNode1.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(0)
            })

            test('Duplicate privacy group', async () => {
                duplicatePrivacyGroupId = await providerNode2.createPrivacyGroup(
                    node2,
                    'Node2_3',
                    'node2, [node2, node3]',
                    [node2, node3])
                expect(duplicatePrivacyGroupId).toMatch(RegEx.base64)
                expect(duplicatePrivacyGroupId).toHaveLength(44)
                expect(duplicatePrivacyGroupId).toEqual(firstPrivacyGroupId)
            })

            test('node1 can\'t delete a privacy group they are not a member of', async () => {
                expect.assertions(2)
                try {
                    await providerNode1.deletePrivacyGroup(node2, firstPrivacyGroupId)
                }
                catch (err) {
                    expect(err).toBeInstanceOf(Error)
                    expect(err.message).toMatch(/Error deleting privacy group/)
                }
            })

            test('node2 deletes first privacy group', async () => {
                const deletedPrivacyGroupId = await providerNode2.deletePrivacyGroup(node2, firstPrivacyGroupId)
                expect(deletedPrivacyGroupId).toEqual(firstPrivacyGroupId)

                const results = await providerNode2.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(1)
            })

            test('deleted privacy group has propagated to node3', async () => {
                const results = await providerNode3.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(1)
            })

            // TODO delete once create does not duplicate
            test('node3 deletes duplicate privacy group', async () => {
                const result = await providerNode3.deletePrivacyGroup(node3, duplicatePrivacyGroupId)
                expect(result).toEqual(duplicatePrivacyGroupId)

                const results = await providerNode3.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(0)
            })

            test('deleted privacy group has propagated to node2', async () => {
                const results = await providerNode2.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(0)
            })
        })

        describe('Successful', () => {

            const privacyGroups: string[] = []

            test.each`
            reason | privateFrom | name | description | addresses
            ${'all three nodes'} | ${node1} | ${'Short name'} | ${'Top secret stuff in this long description'} | ${[node1, node2, node3]}
            ${'duplicate'} | ${node1}  | ${'Short name'} | ${'Top secret stuff in this long description'} | ${[node1, node2, node3]}
            ${'all three nodes diff name and desc'} | ${node1}  | ${'Second group'} | ${'Second group with the same members'} | ${[node1, node2, node3]}
            ${'only self in group'} | ${node3} | ${'Self'} | ${'Only self in group'} | ${[node3]}
            `('$reason when privateFrom $privateFrom, name $name, description $description and addresses $addresses',
                async ({privateFrom, name, description, addresses}) => {
                    const privacyGroupId = await providerNode1.createPrivacyGroup(privateFrom, name, description, addresses)
                    expect(privacyGroupId).toMatch(RegEx.base64)
                    expect(privacyGroupId).toHaveLength(44)

                    privacyGroups.push(privacyGroupId)
                })

            test('delete each groups', () => {
                privacyGroups.forEach(async (privacyGroupId) => {
                    const result = await providerNode1.deletePrivacyGroup(node1, privacyGroupId)
                    expect(result).toEqual(privacyGroupId)
                })
            })
        })

        describe('Failed', () => {
            test.each`
            reason | errorRegEx | privateFrom | name | description | addresses
            ${'privateFrom undefined'} | ${/Invalid params/} | ${undefined}  | ${'Test'} | ${'Test desc'} | ${[node2, node3]}
            ${'addresses undefined'} | ${/Invalid params/} | ${node1}  | ${'Test'} | ${'Test desc'} | ${undefined}
            ${'addresses empty array'} | ${/Error creating privacy group/} | ${node1}  | ${'Test'} | ${'Test desc'} | ${[]}
            ${'invalid node in addresses'} | ${/Error creating privacy group/} | ${node2}  | ${'Test'} | ${'Test desc'} | ${[node2, invalidNode]}
            ${'invalid privateFrom'} | ${/Error creating privacy group/} | ${invalidNode}  | ${'Test'} | ${'Test desc'} | ${[node2, node3]}
            ${'privateFrom not in addresses'} | ${/the list of addresses should include self/} | ${node1}  | ${'Second group'} | ${'Second group with the same members'} | ${[node2, node3]}
            `('$reason to fail with $errorRegEx when privateFrom $privateFrom, name $name, description $description and addresses $addresses',

                async ({privateFrom, errorRegEx, name, description, addresses}) => {

                    expect.assertions(2)

                    try {
                        await providerNode1.createPrivacyGroup(privateFrom, name, description, addresses)
                    }
                    catch (err) {
                        expect(err).toBeInstanceOf(Error)
                        expect(err.message).toMatch(errorRegEx)
                    }
                })
        })
    })

    describe('Create privacy group and send transactions', () => {

        let testPrivacyGroupId: string
        let privateNonceNode3: number
        let publicNonce: number
        let txHash: string

        const txFromAddress = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf'
        const privateKey = '0x0000000000000000000000000000000000000000000000000000000000000001'
        let eeaWallet = new EeaWallet(privateKey)

        test('Create new privacy group', async () => {
            testPrivacyGroupId = await providerNode3.createPrivacyGroup(
                node3,
                'Node 1 & 3',
                'node3, [node1, node3]',
                [node1, node3])
            expect(testPrivacyGroupId).toMatch(RegEx.base64)
            expect(testPrivacyGroupId).toHaveLength(44)
        })

        describe('pre transaction checks', () => {
            test('get private transaction count from node 3', async () => {
                const privateNonce = await providerNode3.getPrivateTransactionCount(txFromAddress, testPrivacyGroupId)
                expect(privateNonce).toBeGreaterThanOrEqual(0)
            })

            test('get private transaction count from node 2', async () => {
                const privateNonce = await providerNode2.getPrivateTransactionCount(txFromAddress, testPrivacyGroupId)
                expect(privateNonce).toBeGreaterThanOrEqual(0)
            })

            test('get private transaction count from node 1', async () => {
                const privateNonce = await providerNode1.getPrivateTransactionCount(txFromAddress, testPrivacyGroupId)
                expect(privateNonce).toBeGreaterThanOrEqual(0)
            })

            test('get public transaction count from node 3', async () => {
                publicNonce = await providerNode3.getTransactionCount(txFromAddress)
                expect(publicNonce).toEqual(0)
            })
        })

        test('send signed deploy transaction', async () => {

            // deploy a contract
            const unsignedTransaction: EeaTransactionRequest = {
                nonce: privateNonceNode3,
                gasPrice: 0,
                gasLimit: 3000000,
                // to: undefined,
                value: 0,
                data: '0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610221806100606000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633fa4f2451461005c5780636057361d1461008757806367e404ce146100b4575b600080fd5b34801561006857600080fd5b5061007161010b565b6040518082815260200191505060405180910390f35b34801561009357600080fd5b506100b260048036038101908080359060200190929190505050610115565b005b3480156100c057600080fd5b506100c96101cb565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6000600254905090565b7fc9db20adedc6cf2b5d25252b101ab03e124902a73fcb12b753f3d1aaa2d8f9f53382604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a18060028190555033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050905600a165627a7a723058208efaf938851fb2d235f8bf9a9685f149129a30fe0f4b20a6c1885dc02f639eba0029',
                chainId: 2018,
                privateFrom: node3,
                privateFor: testPrivacyGroupId
            }

            const signedTransaction = await eeaWallet.signTransaction(unsignedTransaction)

            const tx = await providerNode3.sendPrivateTransaction(signedTransaction)
            expect(tx.hash).toMatch(RegEx.transactionHash)
            txHash = tx.hash

            // wait for the transaction to be mined
            const txReceipt = await providerNode3.waitForTransaction(tx.hash)
            expect(txReceipt.status).toEqual(1)
            expect(txReceipt.contractAddress).toBeNull()
        }, 30000)

        describe('Post transaction count checks', () => {
            test('get private transaction count from node 3', async () => {
                privateNonceNode3 = await providerNode3.getPrivateTransactionCount(txFromAddress, testPrivacyGroupId)
                expect(privateNonceNode3).toBeGreaterThanOrEqual(1)
            })

            test('get private transaction count from node 2', async () => {
                privateNonceNode3 = await providerNode2.getPrivateTransactionCount(txFromAddress, testPrivacyGroupId)
                expect(privateNonceNode3).toBeGreaterThanOrEqual(0)
            })

            test('get private transaction count from node 1', async () => {
                privateNonceNode3 = await providerNode1.getPrivateTransactionCount(txFromAddress, testPrivacyGroupId)
                expect(privateNonceNode3).toBeGreaterThanOrEqual(1)
            })

            test('get public transaction count from node 3', async () => {
                publicNonce = await providerNode3.getTransactionCount(txFromAddress)
                expect(publicNonce).toEqual(0)
            })

            test('get public transaction count from node 2', async () => {
                publicNonce = await providerNode2.getTransactionCount(txFromAddress)
                expect(publicNonce).toEqual(0)
            })

            test('get public transaction count from node 1', async () => {
                publicNonce = await providerNode1.getTransactionCount(txFromAddress)
                expect(publicNonce).toEqual(0)
            })
        })

        describe('Get private transaction receipt', () => {
            test('from node 3', async() => {
                const txReceipt = await providerNode3.getPrivateTransactionReceipt(txHash)
                expect(txReceipt.contractAddress).toMatch(RegEx.ethereumAddress)
                expect(txReceipt.from).toEqual('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf')
                expect(txReceipt.to).toBeUndefined()
            })

            test('from node 2', async() => {
                const txReceipt = await providerNode2.getPrivateTransactionReceipt(txHash)
                expect(txReceipt).toBeNull()
            })

            test('from node 1', async() => {
                const txReceipt = await providerNode1.getPrivateTransactionReceipt(txHash)
                expect(txReceipt.contractAddress).toMatch(RegEx.ethereumAddress)
                expect(txReceipt.from).toEqual('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf')
                expect(txReceipt.to).toBeUndefined()
            })
        })
    })

    describe('private for only one other party', () => {
        describe.each`
        testDescription | privacyGroup | txOptions | txFromAddress
        ${'find count and receipt using privateFrom and privateFor'} | ${ {privateFrom: node1, privateFor: [node2]} } | ${ {privateFrom: node1, privateFor: [node2]} } | ${'fe3b557e8fb62b89f4916b721be55ceb828dbd73'}
        ${'find count and receipt using privacy group id'} | ${'DyAOiF/ynpc+JXa2YAGB0bCitSlOMNm+ShmB/7M6C4w='} | ${ {privateFrom: node1, privateFor: [node2]} } | ${'fe3b557e8fb62b89f4916b721be55ceb828dbd73'}
        ${'privateFor using privacyGroupId'} | ${'DyAOiF/ynpc+JXa2YAGB0bCitSlOMNm+ShmB/7M6C4w='} | ${ {privateFrom: node1, privateFor: 'DyAOiF/ynpc+JXa2YAGB0bCitSlOMNm+ShmB/7M6C4w='} } | ${'fe3b557e8fb62b89f4916b721be55ceb828dbd73'}
    `('$testDescription. Params: privacyGroup $privacyGroup, txOptions $txOptions and from $txFromAddress',
            ({testDescription, txFromAddress, privacyGroup, txOptions}) => {

                let eeaWallet: EeaWallet
                let privateNonce: number
                let publicNonce: number
                let txHash: string

                beforeAll(() => {
                    // fe3b557e8fb62b89f4916b721be55ceb828dbd73
                    const privateKey = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63'
                    eeaWallet = new EeaWallet(privateKey)
                })

                test('get private transaction count from node1', async () => {
                    privateNonce = await providerNode1.getPrivateTransactionCount(txFromAddress, privacyGroup)
                    expect(privateNonce).toBeGreaterThanOrEqual(0)
                })

                test('get public transaction count from node1', async () => {
                    publicNonce = await providerNode1.getTransactionCount(txFromAddress)
                    expect(publicNonce).toEqual(0)
                })

                test('send signed deploy transaction', async () => {

                    // deploy a contract
                    const unsignedTransaction: EeaTransactionRequest = {
                        nonce: privateNonce,
                        gasPrice: 0,
                        gasLimit: 3000000,
                        // to: undefined,
                        value: 0,
                        data: '0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610221806100606000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633fa4f2451461005c5780636057361d1461008757806367e404ce146100b4575b600080fd5b34801561006857600080fd5b5061007161010b565b6040518082815260200191505060405180910390f35b34801561009357600080fd5b506100b260048036038101908080359060200190929190505050610115565b005b3480156100c057600080fd5b506100c96101cb565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6000600254905090565b7fc9db20adedc6cf2b5d25252b101ab03e124902a73fcb12b753f3d1aaa2d8f9f53382604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a18060028190555033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050905600a165627a7a723058208efaf938851fb2d235f8bf9a9685f149129a30fe0f4b20a6c1885dc02f639eba0029',
                        chainId: 2018,
                        ...txOptions
                    }

                    const signedTransaction = await eeaWallet.signTransaction(unsignedTransaction)

                    const tx = await providerNode1.sendPrivateTransaction(signedTransaction)
                    expect(tx.hash).toMatch(RegEx.transactionHash)
                    txHash = tx.hash

                    console.log(`Server tx hash: ${txHash}`)
                    console.log(`Client tx hash: ${keccak256(signedTransaction)}`)

                    // wait for the transaction to be mined
                    const txReceipt = await providerNode1.waitForTransaction(tx.hash)
                    expect(txReceipt.status).toEqual(1)
                    expect(txReceipt.contractAddress).toBeNull()
                }, 30000)

                test('get private transaction counts from each node', async () => {
                    const nonceNode1 = await providerNode1.getPrivateTransactionCount(txFromAddress, privacyGroup)
                    expect(nonceNode1).toBeGreaterThanOrEqual(privateNonce + 1)

                    const nonceNode2 = await providerNode2.getPrivateTransactionCount(txFromAddress, privacyGroup)
                    expect(nonceNode2).toBeGreaterThanOrEqual(privateNonce + 1)

                    const nonceNode3 = await providerNode3.getPrivateTransactionCount(txFromAddress, privacyGroup)
                    expect(nonceNode3).toBeGreaterThanOrEqual(publicNonce)
                })

                test('get public transaction count from each node', async () => {
                    const nonceNode1 = await providerNode1.getTransactionCount(txFromAddress)
                    expect(nonceNode1).toBeGreaterThanOrEqual(publicNonce)

                    const nonceNode2 = await providerNode2.getTransactionCount(txFromAddress)
                    expect(nonceNode2).toBeGreaterThanOrEqual(publicNonce)

                    const nonceNode3 = await providerNode3.getTransactionCount(txFromAddress)
                    expect(nonceNode3).toBeGreaterThanOrEqual(publicNonce)
                })

                test('get public transaction receipts from each node', async () => {
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

                test('get private transaction receipts from each node', async () => {
                    const txReceiptNode1 = await providerNode1.getPrivateTransactionReceipt(txHash)
                    expect(txReceiptNode1.contractAddress).toMatch(RegEx.ethereumAddress)
                    expect(txReceiptNode1.from).toMatch(RegEx.ethereumAddress)
                    expect(txReceiptNode1.to).toBeUndefined()

                    const txReceiptNode2 = await providerNode2.getPrivateTransactionReceipt(txHash)
                    expect(txReceiptNode2.contractAddress).toMatch(RegEx.ethereumAddress)
                    expect(txReceiptNode2.from).toMatch(RegEx.ethereumAddress)
                    expect(txReceiptNode2.to).toBeUndefined()

                    // TODO currently failing. Have raised https://pegasys1.atlassian.net/browse/PAN-2928
                    const txReceiptNode3 = await providerNode3.getPrivateTransactionReceipt(txHash)
                    expect(txReceiptNode3).toBeNull()
                }, 15000)
            })
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
