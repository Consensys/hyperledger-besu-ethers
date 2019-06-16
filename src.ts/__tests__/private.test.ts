import * as privateEthers from '../index'

describe('Private Ethers', () => {

    test('init', ()=> {
        expect(privateEthers).toBeDefined()
        expect(privateEthers.utils).toBeDefined()
        expect(privateEthers.utils.serialize).toBeDefined()
    })

    test('sign private transaction', async() => {

        // private key for account "0x7357589f8e367c2C31F51242fB77B350A11830F3"
        let privateKey = "0x3141592653589793238462643383279502884197169399375105820974944592"
        let wallet = new privateEthers.Wallet(privateKey)

        // All properties are optional
        let transaction = {
            nonce: 0,
            gasLimit: 21000,
            gasPrice: privateEthers.BigNumber.from("20000000000"),

            to: "0x88a5C2d9919e46F883EB62F7b8Dd9d0CC45bc290",
            // ... or supports ENS names
            // to: "ricmoo.firefly.eth",

            value: privateEthers.utils.parseEther("1.0"),
            data: "0x",

            privateFrom: '0x7357589f8e367c2C31F51242fB77B350A11830F3',
            restriction: 'restricted',
            privateFor: ['0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A', '0x1563915e194D8CfBA1943570603F7606A3115508'],
        }

        let signedTransaction = await wallet.signTransaction(transaction)

        expect(signedTransaction).toBeDefined()
    })
})
