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

  let success = await provider.removePeer("enode://af80b90d25145da28c583359beb47b21796b2fe1a23c1511e443e7a64dfdb27d7434c380f0aa4c500e220aa1a9d068514b1ff4d5019e624e7ba1efe82b340a59@127.0.0.1:30303")

  success = await provider.addPeer("enode://af80b90d25145da28c583359beb47b21796b2fe1a23c1511e443e7a64dfdb27d7434c380f0aa4c500e220aa1a9d068514b1ff4d5019e624e7ba1efe82b340a59@127.0.0.1:30303")
}

example()
