import { providers } from '../index'

jest.setTimeout(15000)

const provider = new providers.BesuProvider("http://localhost:20000");
provider.on('debug', (info) => {
    console.log(`Sent "${info.action}" action to node 1 with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

describe('Permissioning APIs', () => {

    test('add accounts to whitelist', async() => {
        const result = await provider.addAccountsToWhitelist(["0xb9b81ee349c3807e46bc71aa2632203c5b462032", "0xb9b81ee349c3807e46bc71aa2632203c5b462034"])
        expect(result).toEqual('Success')
    })
})
