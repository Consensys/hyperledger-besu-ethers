import { providers } from '../index'

jest.setTimeout(15000)

const provider = new providers.BesuProvider("http://localhost:20000");
provider.on('debug', (info) => {
    console.log(`Sent "${info.action}" action to node 1 with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})
const providerNode2 = new providers.BesuProvider("http://localhost:20002");

describe('Admin APIs', () => {

    let node2enode: string

    test('change log level', async() => {
        const result = await provider.changeLogLevel('TRACE')
        expect(result).toBeTruthy()
    })

    test('get nodeInfo', async() => {
        const nodeInfo = await provider.getNodeInfo()

        expect(nodeInfo.id).toMatch(/^([A-Fa-f0-9]{128})$/)
        expect(typeof nodeInfo.enode).toEqual('string')
        expect(typeof nodeInfo.listenAddr).toEqual('string')
        expect(typeof nodeInfo.name).toEqual('string')
        expect(nodeInfo.ports.discovery).toBeGreaterThan(30000)
        expect(nodeInfo.ports.listener).toBeGreaterThan(30000)
        expect(nodeInfo.protocols).toBeDefined()
    })

    test('get peers', async() => {
        const peers = await provider.getPeers()

        expect(peers).toHaveLength(5)
        expect(peers[0].version).toEqual('0x5')
        expect(typeof peers[0].name).toEqual('string')
        expect(peers[0].caps.length).toBeGreaterThan(1)
        expect(typeof peers[0].network.localAddress).toEqual('string')
        expect(typeof peers[0].network.remoteAddress).toEqual('string')
    })

    test('remove peer', async() => {
        // Get the enode of node 2
        node2enode = (await providerNode2.getNodeInfo()).enode

        const success = await provider.removePeer(node2enode)
        expect(success).toBeTruthy()
    })

    test('add peer', async() => {
        const success = await provider.addPeer(node2enode)
        expect(success).toBeTruthy()
    })

    test('change log level back', async() => {
        const result = await provider.changeLogLevel('INFO')
        expect(result).toBeTruthy()
    })

    test('Besu Statistics', async() => {
        const stats = await provider.getBesuStatistics()
        expect(stats.maxSize).toEqual(4096)
        expect(stats.localCount).toEqual(0)
        expect(stats.remoteCount).toEqual(0)
    })

    test('Besu Transaction', async() => {
        const results = await provider.getBesuTransactions()
        expect(results).toHaveLength(0)
        // expect(results.hash).toEqual(4096)
    })
})
