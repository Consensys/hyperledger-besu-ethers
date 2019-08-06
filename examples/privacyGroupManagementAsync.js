// This example works against the Privacy Enabled Quickstart Tutorial
// https://docs.pantheon.pegasys.tech/en/latest/Tutorials/Privacy-Quickstart/

const providers = require('pantheon-ethers').providers

const node1 = 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo='
const node2 = 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='

// Create a Pantheon provider which will have the privacy group functions
const providerNode1 = new providers.PrivateJsonRpcProvider("http://localhost:20000")

async function example() {
  // Create a new privacy group
  const privacyGroupId = await providerNode1.createPrivacyGroup(
    [node1, node2],
    'Name of group',
    'Description of top secret group')

  console.log(privacyGroupId) // GcFhoLY7EMQg7jxJDC6Aei1GZTN/ZaRepptX48VcUBk=

  // find privacy groups
  const results = await providerNode1.findPrivacyGroup([node1, node2])

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
  const deletedId = await providerNode1.deletePrivacyGroup(privacyGroupId)

  console.log(deletedId) // GcFhoLY7EMQg7jxJDC6Aei1GZTN/ZaRepptX48VcUBk=
}

example()
