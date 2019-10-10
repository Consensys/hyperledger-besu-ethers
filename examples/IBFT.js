const providers = require('hyperledger-besu-ethers').providers
const provider = new providers.BesuProvider("http://localhost:20000");

async function example() {

  // List validators for a block number
  let validators = await provider.ibftGetValidatorsByBlockNumber('latest')
  console.log(validators)
  // [ "0x42d4287eac8078828cf5f3486cfe601a275a49a5", "0xb1b2bc9582d2901afdc579f528a35ca41403fa85", "0xef1bfb6a12794615c9b0b5a21e6741f01e570185" ]

  // List validators for a block
  validators = await provider.ibftGetValidatorsByBlockHash('0xbae7d3feafd743343b9a4c578cab5e5d65eb735f6855fb845c00cab356331256')
  console.log(validators)
  // [ "0x42d4287eac8078828cf5f3486cfe601a275a49a5", "0xb1b2bc9582d2901afdc579f528a35ca41403fa85", "0xef1bfb6a12794615c9b0b5a21e6741f01e570185" ]

  // Proposal to add a new validator
  let success = await provider.ibftProposeValidatorVote("0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73", true)
  console.log(success)  // true

  // Proposal to remove a existing validator
  success = await provider.ibftProposeValidatorVote("0x42eb768f2244c8811c63729a21a3569731535f06", false)
  console.log(success)  // true

  // List outstanding validator votes
  const validatorVotes = await provider.ibftGetPendingVotes()
  console.log(validatorVotes)
  /*
  {
    "0x42eb768f2244c8811c63729a21a3569731535f07": false,
    "0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73": true
  }
  */

  // Remove the proposals to add a new validator
  success = await provider.ibftDiscardValidatorVote("0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73")
  console.log(success)  // true

  // Remove the proposals to remove an existing validator
  success = await provider.ibftDiscardValidatorVote("0x42eb768f2244c8811c63729a21a3569731535f07")
  console.log(success)  // true
}

example()
