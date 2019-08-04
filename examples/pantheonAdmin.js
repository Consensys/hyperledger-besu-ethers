const providers = require('pantheon-ethers').providers

const provider = new providers.PrivateJsonRpcProvider("http://localhost:20000");

async function example() {

  const moduleVersions = await provider.getModuleVersions()
  console.log(moduleVersions)

  await provider.changeLogLevel('TRACE')

  const nodeInfo = await provider.getNodeInfo()
  console.log(nodeInfo)

  console.log(nodeInfo.protocols.eth.config)

  const peers = await provider.getPeers()
  console.log(peers)

  let success = await provider.addPeer("enode://f59c0ab603377b6ec88b89d5bb41b98fc385030ab1e4b03752db6f7dab364559d92c757c13116ae6408d2d33f0138e7812eb8b696b2a22fe3332c4b5127b22a3@127.0.0.1:30304")

  success = await provider.removePeer("enode://f59c0ab603377b6ec88b89d5bb41b98fc385030ab1e4b03752db6f7dab364559d92c757c13116ae6408d2d33f0138e7812eb8b696b2a22fe3332c4b5127b22a3@127.0.0.1:30304")

}

example()
