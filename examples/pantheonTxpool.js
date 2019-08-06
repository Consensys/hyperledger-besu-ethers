const providers = require('pantheon-ethers').providers
const provider = new providers.PantheonProvider("http://localhost:20000");

async function example() {

  const stats = await provider.getPantheonStatistics()
  console.log(stats)
  // { maxSize: 4096, localCount: 0, remoteCount: 0 }

  const txs = await provider.getPantheonTransactions()
  console.log(txs)
  /* [
    {
        "hash": "0x8a66830098be4006a3f63a03b6e9b67aa721e04bd6b46d420b8f1937689fb4f1",
        "isReceivedFromLocalSource": true,
        "addedToPoolAt": "2019-03-21T01:35:50.911Z"
    },
    {
        "hash": "0x41ee803c3987ceb5bcea0fad7a76a8106a2a6dd654409007d9931032ea54579b",
        "isReceivedFromLocalSource": true,
        "addedToPoolAt": "2019-03-21T01:36:00.374Z"
    }]
  */
}

example()
