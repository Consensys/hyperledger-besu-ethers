// This example works against the Private Network with Privacy Enabled Quickstart Tutorial
// https://besu.hyperledger.org/en/latest/Tutorials/Quickstarts/Privacy-Quickstart/
// Node.js 8 or above is required as async/await is used.

const providers = require('hyperledger-besu-ethers').providers
// Create a Pantheon provider which will have the privacy group functions
const provider = new providers.PrivateJsonRpcProvider("http://localhost:20000")

const node1 = 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo='
const node2 = 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='

async function example() {
  // Create a new privacy group
  const privacyGroupId = await provider.createPrivacyGroup(
    [node1, node2],
    'Name of group',
    'Description of top secret group')

  console.log(privacyGroupId) // GcFhoLY7EMQg7jxJDC6Aei1GZTN/ZaRepptX48VcUBk=

  // find privacy groups
  const results = await provider.findPrivacyGroup([node1, node2])

  console.log(results)
  /*
  [ { privacyGroupId: 'GcFhoLY7EMQg7jxJDC6Aei1GZTN/ZaRepptX48VcUBk=',
      name: 'Name of group',
      description: 'Description of top secret group',
      type: 'PANTHEON',
      members:
       [ 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=',
         'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs=' ] } ]
   */

  // delete privacy group
  const deletedId = await provider.deletePrivacyGroup(privacyGroupId)

  console.log(deletedId) // GcFhoLY7EMQg7jxJDC6Aei1GZTN/ZaRepptX48VcUBk=
}

example()
