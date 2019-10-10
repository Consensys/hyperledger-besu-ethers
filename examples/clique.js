const providers = require('hyperledger-besu-ethers').providers
const provider = new providers.BesuProvider("http://localhost:20000");

async function example() {

  // List all signers that are part of PoA consensus
  let signers = await provider.cliqueGetSigners('latest')
  console.log(signers)
  // [ "0x42eb768f2244c8811c63729a21a3569731535f06", "0x7ffc57839b00206d1ad20c69a1981b489f772031", "0xb279182d99e65703f0076e4812653aab85fca0f0" ]

  // List all signers that are part of PoA consensus
  signers = await provider.cliqueGetSignersAtHash('0x98b2ddb5106b03649d2d337d42154702796438b3c74fd25a5782940e84237a48')
  console.log(signers)
  // [ "0x42eb768f2244c8811c63729a21a3569731535f06", "0x7ffc57839b00206d1ad20c69a1981b489f772031", "0xb279182d99e65703f0076e4812653aab85fca0f0" ]

  // Proposal to add a new signer
  let success = await provider.cliquePropose("0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73", true)
  console.log(success)  // true

  // Proposal to remove a existing signer
  success = await provider.cliquePropose("0x42eb768f2244c8811c63729a21a3569731535f06", false)
  console.log(success)  // true

  // List outstanding proposals
  const proposals = await provider.cliqueGetProposals()
  console.log(proposals)
  /*
  {
    "0x42eb768f2244c8811c63729a21a3569731535f07": false,
    "0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73": true
  }
  */

  // Remove the proposals to add a new signer
  success = await provider.cliqueDiscard("0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73")
  console.log(success)  // true

  // Remove the proposals to remove an existing signer
  success = await provider.cliqueDiscard("0x42eb768f2244c8811c63729a21a3569731535f07")
  console.log(success)  // true
}

example()
