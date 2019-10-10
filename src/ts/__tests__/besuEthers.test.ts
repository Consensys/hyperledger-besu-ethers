
import * as BesuEthers from '../index'
import {PrivateWallet, generatePrivacyGroup, providers, PrivateTransactionRequest, PrivacyGroupOptions, utils} from '../index'

jest.setTimeout(15000)

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

const preCompiledContractAddress = '0x000000000000000000000000000000000000007E'
const node1 = 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo='
const node2 = 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='
const node3 = 'k2zXEin4Ip/qBGlRkJejnGWdP9cjkK+DAvKNW31L2C8='
const node3Address = '0xf17f52151EbEF6C7334FAD080c5704D77216b732'

describe('Ethers', () => {

    let node1EnodeUrl: string

    beforeAll(async () => {
        node1EnodeUrl = await providerNode1.send('net_enode', [])
        console.log(`enode url ${node1EnodeUrl}\nnode1 public key: ${node1EnodeUrl.substring(9, 136)}`)
    })

    test('Check overridden functions have been exported', ()=> {
        expect(BesuEthers).toBeDefined()
        expect(BesuEthers.utils).toBeDefined()
        expect(BesuEthers.utils.serialize).toBeInstanceOf(Function)
        expect(BesuEthers.utils.encode).toBeInstanceOf(Function)
        expect(BesuEthers.providers.PrivateJsonRpcProvider).toBeInstanceOf(Function)
        expect(BesuEthers.providers.BesuProvider).toBeInstanceOf(Function)
    })

    test('signed transaction matches EEA client', async() => {

        // fe3b557e8fb62b89f4916b721be55ceb828dbd73
        const privateKey = '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63'
        let wallet = new PrivateWallet(privateKey)

        // deploy a contract
        const unsignedTransaction: PrivateTransactionRequest = {
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

        // From web3js-eea eventEmitter example
        const eeaSignedRlpEncoded = '0xf9031f8080832dc6c08080b90281608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610221806100606000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633fa4f2451461005c5780636057361d1461008757806367e404ce146100b4575b600080fd5b34801561006857600080fd5b5061007161010b565b6040518082815260200191505060405180910390f35b34801561009357600080fd5b506100b260048036038101908080359060200190929190505050610115565b005b3480156100c057600080fd5b506100c96101cb565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6000600254905090565b7fc9db20adedc6cf2b5d25252b101ab03e124902a73fcb12b753f3d1aaa2d8f9f53382604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a18060028190555033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050905600a165627a7a723058208efaf938851fb2d235f8bf9a9685f149129a30fe0f4b20a6c1885dc02f639eba0029820fe7a0ea2340ef4a0d32e2c44fed9b8d880a38a1ecfbef618ca0234a404c2360719617a063acf2ee8286787f3ebb640da56ded5952c8bdc8d1bf374e2dfe5afdeb79bea8a0035695b4cc4b0941e60551d7a19cf30603db5bfc23e5ac43a56f57f25f75486ae1a02a8d9b56a0fe9cd94d60be4413bcb721d3a7be27ed8e28b3a6346df874ee141b8a72657374726963746564'

        const signedTransaction = await wallet.signPrivateTransaction(unsignedTransaction)
        expect(signedTransaction).toEqual(eeaSignedRlpEncoded)

        const parsedTransaction = providerNode1.formatter.transaction(signedTransaction)
        expect(parsedTransaction.nonce).toEqual(unsignedTransaction.nonce)
        expect(parsedTransaction.to).toBeNull()
        expect(parsedTransaction.from).toEqual(await wallet.getAddress())
        expect(parsedTransaction.data).toEqual(unsignedTransaction.data)
        expect(parsedTransaction.chainId).toEqual(unsignedTransaction.chainId)
        expect(parsedTransaction.privateFrom).toEqual(unsignedTransaction.privateFrom)
        expect(parsedTransaction.privateFor).toEqual(unsignedTransaction.privateFor)
        expect(parsedTransaction.restriction).toEqual(unsignedTransaction.restriction)

        // compare properties that are parsed as a BigNumber
        expect(parsedTransaction.gasPrice.eq(unsignedTransaction.gasPrice)).toBeTruthy()
        expect(parsedTransaction.gasLimit.eq(unsignedTransaction.gasLimit)).toBeTruthy()
        expect(parsedTransaction.value.eq(unsignedTransaction.value)).toBeTruthy()
    })

    describe('getPrivateTransactionReceipt', () => {
        test('missing hash', async () => {
            const result = await providerNode1.getPrivateTransactionReceipt('0x0000000000000000000000000000000000000000000000000000000000000001')
            expect(result).toBeNull()
        })
    })

    test('get precompiled contract', async () => {
        const result = await providerNode1.getPrivacyPrecompileAddress()
        expect(result).toEqual(preCompiledContractAddress.toLowerCase())
    })

    describe('Create privacy group and send transactions', () => {

        let testPrivacyGroupId: string
        let testPrivacyGroupOptions: PrivacyGroupOptions
        let prePrivateNonce: number
        let publicNonce: number
        let node3Nonce: number
        let publicTxHash: string
        let privateTxHash: string

        // have to set here as it's used in the Jest describe.each template which is run before BeforeAll is run
        const txFromAddress = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf'
        const privateKey = '0x0000000000000000000000000000000000000000000000000000000000000001'
        const deployData = '0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610221806100606000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633fa4f2451461005c5780636057361d1461008757806367e404ce146100b4575b600080fd5b34801561006857600080fd5b5061007161010b565b6040518082815260200191505060405180910390f35b34801561009357600080fd5b506100b260048036038101908080359060200190929190505050610115565b005b3480156100c057600080fd5b506100c96101cb565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6000600254905090565b7fc9db20adedc6cf2b5d25252b101ab03e124902a73fcb12b753f3d1aaa2d8f9f53382604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a18060028190555033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050905600a165627a7a723058208efaf938851fb2d235f8bf9a9685f149129a30fe0f4b20a6c1885dc02f639eba0029'
        let eeaWallet = new PrivateWallet(privateKey)

        test('Create new privacy group', async () => {
            testPrivacyGroupId = await providerNode3.createPrivacyGroup(
                [node1, node3],
                'Node 1 & 3',
                'node3, [node1, node3]')
            console.log(`Node 3 created privacy group id ${testPrivacyGroupId}`)
            expect(testPrivacyGroupId).toMatch(utils.RegEx.base64)
            expect(testPrivacyGroupId).toHaveLength(44)

            testPrivacyGroupOptions = {
                privateFor: testPrivacyGroupId,
                restriction: 'restricted',
            }
        })

        describe('pre transaction checks', () => {
            describe('get private transaction count from', () => {
                test('node 3', async () => {
                    prePrivateNonce = await providerNode3.getPrivateTransactionCount(txFromAddress, testPrivacyGroupOptions)
                    expect(prePrivateNonce).toBeGreaterThanOrEqual(0)
                })

                test('node 2', async () => {
                    const result = await providerNode2.getPrivateTransactionCount(txFromAddress, testPrivacyGroupOptions)
                    expect(result).toEqual(prePrivateNonce)
                })

                test('node 1', async () => {
                    const result = await providerNode1.getPrivateTransactionCount(txFromAddress, testPrivacyGroupOptions)
                    expect(result).toEqual(prePrivateNonce)
                })
            })

            describe('get public transaction count from ', () => {
                test('node 3 from address', async () => {
                    publicNonce = await providerNode3.getTransactionCount(txFromAddress)
                    expect(publicNonce).toEqual(0)
                })

                test('node 3 signing address', async () => {
                    node3Nonce = await providerNode3.getTransactionCount(node3Address)
                    expect(publicNonce).toEqual(0)
                })
            })
        })

        test('node 3 sends signed deploy transaction', async () => {

            // deploy a contract
            const unsignedTransaction: PrivateTransactionRequest = {
                nonce: prePrivateNonce,
                gasPrice: 0,
                gasLimit: 3000000,
                // to: undefined,
                value: 0,
                data: deployData,
                chainId: 2018,
                privateFrom: node3,
                privateFor: testPrivacyGroupId,
                restriction: 'restricted'
            }

            const signedTransaction = await eeaWallet.signPrivateTransaction(unsignedTransaction)

            const tx = await providerNode3.sendPrivateTransaction(signedTransaction)
            expect(tx.publicHash).toMatch(utils.RegEx.transactionHash)
            expect(tx.privateHash).toMatch(utils.RegEx.transactionHash)
            expect(tx.privateHash).not.toEqual(tx.publicHash)
            publicTxHash = tx.publicHash
            privateTxHash = tx.privateHash

            // wait for the public transaction to be mined
            const txReceipt = await providerNode3.waitForTransaction(tx.publicHash)
            expect(txReceipt.status).toEqual(1)
            expect(txReceipt.contractAddress).toBeNull()
            expect(txReceipt.to).toEqual(preCompiledContractAddress)
        })

        describe('Post transaction count checks', () => {
            describe('get private transaction count from', () => {
                test('node 3 from address', async () => {
                    const result = await providerNode3.getPrivateTransactionCount(txFromAddress, testPrivacyGroupOptions)
                    expect(result).toEqual(prePrivateNonce + 1)
                })

                test('node 2', async () => {
                    const result = await providerNode2.getPrivateTransactionCount(txFromAddress, testPrivacyGroupOptions)
                    expect(result).toEqual(0)
                })

                test('node 1', async () => {
                    const result = await providerNode1.getPrivateTransactionCount(txFromAddress, testPrivacyGroupOptions)
                    expect(result).toEqual(prePrivateNonce + 1)
                })
            })

            describe('get public transaction count from',() => {
                test('node 3', async () => {
                    publicNonce = await providerNode3.getTransactionCount(txFromAddress)
                    expect(publicNonce).toEqual(0)
                })

                test('node 3 signing address', async () => {
                    const result = await providerNode3.getTransactionCount(node3Address)
                    expect(result).toEqual(node3Nonce)
                })

                test('node 2', async () => {
                    publicNonce = await providerNode2.getTransactionCount(txFromAddress)
                    expect(publicNonce).toEqual(0)
                })

                test('node 1', async () => {
                    publicNonce = await providerNode1.getTransactionCount(txFromAddress)
                    expect(publicNonce).toEqual(0)
                })
            })

            describe('Get private transaction receipt using public tx hash from', () => {
                test('node 3', async() => {
                    const txReceipt = await providerNode3.getPrivateTransactionReceipt(publicTxHash)
                    expect(txReceipt.contractAddress).toMatch(utils.RegEx.ethereumAddress)
                    expect(txReceipt.from).toEqual('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf')
                    expect(txReceipt.to).toBeNull()
                    expect(txReceipt.logs).toEqual([])
                    // FIXME need to validate the output
                    // expect(txReceipt.output).toEqual(deployData)
                })

                test('node 2', async() => {
                    const txReceipt = await providerNode2.getPrivateTransactionReceipt(publicTxHash)
                    expect(txReceipt).toBeNull()
                })

                test('node 1', async() => {
                    const txReceipt = await providerNode1.getPrivateTransactionReceipt(publicTxHash)
                    expect(txReceipt.contractAddress).toMatch(utils.RegEx.ethereumAddress)
                    expect(txReceipt.from).toEqual('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf')
                    expect(txReceipt.to).toBeNull()
                    expect(txReceipt.logs).toEqual([])
                    // FIXME need to validate the output
                    // expect(txReceipt.output).toEqual(deployData)
                })
            })

            describe('Get private transaction receipt using private tx hash from', () => {
                test('node 3', async() => {
                    const txReceipt = await providerNode3.getPrivateTransactionReceipt(privateTxHash)
                    expect(txReceipt).toBeNull()
                })

                test('node 2', async() => {
                    const txReceipt = await providerNode2.getPrivateTransactionReceipt(privateTxHash)
                    expect(txReceipt).toBeNull()
                })

                test('node 1', async() => {
                    const txReceipt = await providerNode1.getPrivateTransactionReceipt(privateTxHash)
                    expect(txReceipt).toBeNull()
                })
            })

            describe('Get public transaction receipt using public tx hash from', () => {
                test('node 3', async() => {
                    const txReceipt = await providerNode3.getTransactionReceipt(publicTxHash)
                    expect(txReceipt.status).toEqual(1)
                    expect(txReceipt.contractAddress).toBeNull()
                    expect(txReceipt.from).not.toEqual(node3Address)
                    expect(txReceipt.from).toMatch(utils.RegEx.ethereumAddress)
                    expect(txReceipt.to).toEqual(preCompiledContractAddress)
                    expect(txReceipt.logs).toEqual([])
                    expect(txReceipt.transactionHash).toEqual(publicTxHash)
                })

                test('node 2', async() => {
                    const txReceipt = await providerNode2.getTransactionReceipt(publicTxHash)
                    expect(txReceipt).toBeDefined()
                    expect(txReceipt.status).toEqual(1)
                    expect(txReceipt.contractAddress).toBeNull()
                    expect(txReceipt.from).not.toEqual(node3Address)
                    expect(txReceipt.from).toMatch(utils.RegEx.ethereumAddress)
                    expect(txReceipt.to).toEqual(preCompiledContractAddress)
                    expect(txReceipt.logs).toEqual([])
                    expect(txReceipt.transactionHash).toEqual(publicTxHash)
                })

                test('node 1', async() => {
                    const txReceipt = await providerNode1.getTransactionReceipt(publicTxHash)
                    expect(txReceipt.status).toEqual(1)
                    expect(txReceipt.contractAddress).toBeNull()
                    expect(txReceipt.from).not.toEqual(node3Address)
                    expect(txReceipt.from).toMatch(utils.RegEx.ethereumAddress)
                    expect(txReceipt.to).toEqual(preCompiledContractAddress)
                    expect(txReceipt.logs).toEqual([])
                    expect(txReceipt.transactionHash).toEqual(publicTxHash)
                })
            })

            describe('Get public transaction using public transaction hash from', () => {
                test('node 3', async() => {
                    const tx = await providerNode3.getTransaction(publicTxHash)

                    privateTxHash = tx.data

                    expect(tx.hash).toEqual(publicTxHash)
                    expect(tx.to).toMatch(utils.RegEx.ethereumAddress)
                    expect(tx.from).not.toEqual(node3Address)
                    expect(tx.from).toMatch(utils.RegEx.ethereumAddress)

                    // FIXME privateTxHash from transaction parse is not correct
                    // expect(tx.data).toEqual(privateTxHash)
                })

                test('node 2', async() => {
                    const tx = await providerNode2.getTransaction(publicTxHash)
                    expect(tx.hash).toEqual(publicTxHash)
                    expect(tx.to).toMatch(utils.RegEx.ethereumAddress)
                    expect(tx.from).not.toEqual(node3Address)
                    expect(tx.from).toMatch(utils.RegEx.ethereumAddress)
                    // FIXME privateTxHash from transaction parse is not correct
                    // expect(tx.data).toEqual(privateTxHash)
                })

                test('node 1', async() => {
                    const tx = await providerNode1.getTransaction(publicTxHash)
                    expect(tx.hash).toEqual(publicTxHash)
                    expect(tx.to).toMatch(utils.RegEx.ethereumAddress)
                    expect(tx.from).not.toEqual(node3Address)
                    expect(tx.from).toMatch(utils.RegEx.ethereumAddress)
                    // FIXME privateTxHash from transaction parse is not correct
                    // expect(tx.data).toEqual(privateTxHash)
                })
            })

            describe('Get public transaction using private tx hash from', () => {
                test('node 3', async() => {
                    const txReceipt = await providerNode3.getTransaction(privateTxHash)
                    expect(txReceipt).toBeNull()
                })

                test('node 2', async() => {
                    const txReceipt = await providerNode2.getTransaction(privateTxHash)
                    expect(txReceipt).toBeNull()
                })

                test('node 1', async() => {
                    const txReceipt = await providerNode1.getTransaction(privateTxHash)
                    expect(txReceipt).toBeNull()
                })
            })

            describe('Get private transaction using public tx hash from', () => {
                test('node 3', async() => {
                    const tx = await providerNode3.getPrivateTransaction(publicTxHash)
                    expect(tx.nonce).toEqual(prePrivateNonce)
                    // expect(tx.publicHash).toBeNull()
                    // expect(tx.privateHash).toEqual(privateTxHash)
                    expect(tx.from).toEqual(txFromAddress)
                    expect(tx.to).toBeNull()
                    expect(tx.data).toEqual(deployData)
                    expect(tx.privateFrom).toEqual(node3)
                    expect(tx.privateFor).toEqual(null)
                    // expect(tx.privacyGroupId).toEqual(testPrivacyGroupId)
                    expect(tx.restriction).toEqual('restricted')

                    // Test BigNumber values
                    expect(tx.value.eq(0)).toBeTruthy()
                    expect(tx.gasLimit.eq(3000000)).toBeTruthy()
                    expect(tx.gasPrice.eq(0)).toBeTruthy()
                })

                test('node 2', async() => {
                    const tx = await providerNode2.getPrivateTransaction(publicTxHash)
                    expect(tx).toBeNull()
                })

                test('node 1', async() => {
                    const tx = await providerNode1.getPrivateTransaction(publicTxHash)
                    expect(tx.nonce).toEqual(prePrivateNonce)
                    // expect(tx.publicHash).toBeNull()
                    // expect(tx.privateHash).toEqual(privateTxHash)
                    expect(tx.from).toEqual(txFromAddress)
                    expect(tx.to).toBeNull()
                    expect(tx.data).toEqual(deployData)
                    expect(tx.privateFrom).toEqual(node3)
                    expect(tx.privateFor).toEqual(null)
                    // expect(tx.privacyGroupId).toEqual(testPrivacyGroupId)
                    expect(tx.restriction).toEqual('restricted')

                    // Test BigNumber values
                    expect(tx.value.eq(0)).toBeTruthy()
                    expect(tx.gasLimit.eq(3000000)).toBeTruthy()
                    expect(tx.gasPrice.eq(0)).toBeTruthy()
                })
            })

            describe('Get private transaction using private tx hash from', () => {
                test('node 3', async() => {
                    const txReceipt = await providerNode3.getPrivateTransaction(privateTxHash)
                    expect(txReceipt).toBeNull()
                })

                test('node 2', async() => {
                    const txReceipt = await providerNode2.getPrivateTransaction(privateTxHash)
                    expect(txReceipt).toBeNull()
                })

                test('node 1', async() => {
                    const txReceipt = await providerNode1.getPrivateTransaction(privateTxHash)
                    expect(txReceipt).toBeNull()
                })
            })
        })
    })

    describe('private for only one other party', () => {
        describe.each`
        testDescription | privacyGroup | txOptions | txFromAddress
        ${'find count and receipt using privateFrom and privateFor'} | ${ {privateFrom: node1, privateFor: [node2]} } | ${ {privateFrom: node1, privateFor: [node2]} } | ${'0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF'}
        ${'find count and receipt using privacy group id'} | ${ {privateFor: 'DyAOiF/ynpc+JXa2YAGB0bCitSlOMNm+ShmB/7M6C4w='} }  | ${ {privateFrom: node1, privateFor: [node2]} } | ${'0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF'}
        ${'privateFor using privacyGroupId'} | ${ {privateFor: 'DyAOiF/ynpc+JXa2YAGB0bCitSlOMNm+ShmB/7M6C4w='} } | ${ {privateFrom: node1, privateFor: 'DyAOiF/ynpc+JXa2YAGB0bCitSlOMNm+ShmB/7M6C4w='} } | ${'0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF'}
    `('$testDescription. Params: privacyGroup $privacyGroup, txOptions $txOptions and from $txFromAddress',
            ({testDescription, txFromAddress, privacyGroup, txOptions}) => {

                let eeaWallet: PrivateWallet
                let privateNonce: number
                let publicNonce: number
                let publicTxHash: string
                let unsignedTransaction: PrivateTransactionRequest

                beforeAll(() => {
                    // 0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF
                    const privateKey = '0x0000000000000000000000000000000000000000000000000000000000000002'
                    eeaWallet = new PrivateWallet(privateKey)
                })

                test('Check privacy group', () => {
                    if (typeof privacyGroup === 'string') {
                        expect(generatePrivacyGroup(txOptions)).toEqual(privacyGroup)
                    }
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
                    unsignedTransaction = {
                        nonce: privateNonce,
                        gasPrice: 0,
                        gasLimit: 3000000,
                        // to: undefined,
                        value: 0,
                        data: '0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610221806100606000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633fa4f2451461005c5780636057361d1461008757806367e404ce146100b4575b600080fd5b34801561006857600080fd5b5061007161010b565b6040518082815260200191505060405180910390f35b34801561009357600080fd5b506100b260048036038101908080359060200190929190505050610115565b005b3480156100c057600080fd5b506100c96101cb565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6000600254905090565b7fc9db20adedc6cf2b5d25252b101ab03e124902a73fcb12b753f3d1aaa2d8f9f53382604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a18060028190555033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050905600a165627a7a723058208efaf938851fb2d235f8bf9a9685f149129a30fe0f4b20a6c1885dc02f639eba0029',
                        chainId: 2018,
                        ...txOptions
                    }

                    const signedTransaction = await eeaWallet.signPrivateTransaction(unsignedTransaction)

                    const tx = await providerNode1.sendPrivateTransaction(signedTransaction)
                    expect(tx.privateHash).toMatch(utils.RegEx.transactionHash)
                    publicTxHash = tx.publicHash
                    expect(tx.nonce).toEqual(unsignedTransaction.nonce)
                    expect(tx.data).toEqual(unsignedTransaction.data)
                    expect(tx.privateFor).toEqual(unsignedTransaction.privateFor)
                    expect(tx.privateFrom).toEqual(unsignedTransaction.privateFrom)
                    expect(tx.chainId).toEqual(unsignedTransaction.chainId)
                    // expect(tx.gasPrice).toEqual(unsignedTransaction.gasPrice)
                    // expect(tx.gasLimit).toEqual(unsignedTransaction.gasLimit)

                    // wait for the public transaction to be mined
                    const txReceipt = await providerNode1.waitForTransaction(tx.publicHash)
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
                    const txReceiptNode1 = await providerNode1.getTransactionReceipt(publicTxHash)
                    expect(txReceiptNode1.status).toEqual(1)
                    expect(txReceiptNode1.transactionHash).toEqual(publicTxHash)
                    expect(txReceiptNode1.contractAddress).toBeNull()

                    const txReceiptNode2 = await providerNode2.getTransactionReceipt(publicTxHash)
                    expect(txReceiptNode2.status).toEqual(1)
                    expect(txReceiptNode2.transactionHash).toEqual(publicTxHash)
                    expect(txReceiptNode2.contractAddress).toBeNull()

                    const txReceiptNode3 = await providerNode3.getTransactionReceipt(publicTxHash)
                    expect(txReceiptNode3.status).toEqual(1)
                    expect(txReceiptNode3.transactionHash).toEqual(publicTxHash)
                    expect(txReceiptNode3.contractAddress).toBeNull()
                })

                test('get private transaction receipts from each node', async () => {
                    const txReceiptNode1 = await providerNode1.getPrivateTransactionReceipt(publicTxHash)
                    expect(txReceiptNode1.contractAddress).toMatch(utils.RegEx.ethereumAddress)
                    expect(txReceiptNode1.from).toMatch(utils.RegEx.ethereumAddress)
                    expect(txReceiptNode1.to).toBeNull()

                    const txReceiptNode2 = await providerNode2.getPrivateTransactionReceipt(publicTxHash)
                    expect(txReceiptNode2.contractAddress).toMatch(utils.RegEx.ethereumAddress)
                    expect(txReceiptNode2.from).toMatch(utils.RegEx.ethereumAddress)
                    expect(txReceiptNode2.to).toBeNull()
                })

                test('try and get private transaction receipt from node not in transaction', async() => {
                    // TODO currently failing. Have raised https://pegasys1.atlassian.net/browse/PAN-2928
                    const txReceiptNode3 = await providerNode3.getPrivateTransactionReceipt(publicTxHash)
                    expect(txReceiptNode3).toBeNull()
                })

                test('get public transaction by hash', async () => {
                    const txNode1 = await providerNode1.getTransaction(publicTxHash)
                    const txNode2 = await providerNode2.getTransaction(publicTxHash)
                    const txNode3 = await providerNode3.getTransaction(publicTxHash)

                    expect(txNode1.data).toMatch(utils.RegEx.bytes32)
                    // TODO validate against node 1 public key
                    expect(txNode1.from).toMatch(utils.RegEx.ethereumAddress)

                    expect(txNode2.from).toMatch(utils.RegEx.ethereumAddress)
                    expect(txNode2.data).toMatch(txNode1.data)

                    expect(txNode3.from).toMatch(utils.RegEx.ethereumAddress)
                    expect(txNode3.data).toMatch(txNode1.data)
                })

                test('get private transaction by hash', async () => {
                    const txNode1 = await providerNode1.getPrivateTransaction(publicTxHash)
                    expect(txNode1.privateFrom).toEqual(txOptions.privateFrom)
                    // TODO this will fail if privacyGroupId is used in the privateFrom
                    expect(txNode1.privateFor).toEqual(txOptions.privateFor)
                    // TODO this will work when privacyGroupId is included in the transaction
                    // expect(txNode1.privacyGroupId).toEqual(txOptions.privateFor)

                    const txNode2 = await providerNode2.getPrivateTransaction(publicTxHash)
                    expect(txNode2.privateFrom).toEqual(txOptions.privateFrom)
                    expect(txNode2.privateFor).toEqual(txOptions.privateFor)
                    // expect(txNode1.privacyGroupId).toEqual(txOptions.privateFor)

                    const txNode3 = await providerNode3.getPrivateTransaction(publicTxHash)
                    expect(txNode3).toEqual(null)
                })
            })
    })
})
