
const providers = require('pantheon-ethers').providers

const node1 = 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo='
const node2 = 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='

// Create a Pantheon provider which will have the privacy group functions
const providerNode1 = new providers.PrivateJsonRpcProvider("http://localhost:20000")

// Create a new privacy group
providerNode1.createPrivacyGroup(
  [node1, node2],
  'Name of group',
  'Description of top secret group')
  .then(result => {
    privacyGroupId = result
    console.log(result) // GcFhoLY7EMQg7jxJDC6Aei1GZTN/ZaRepptX48VcUBk=

    return result
  })
  .then(privacyGroupId => {

    // find privacy groups
    providerNode1.findPrivacyGroup([node1, node2])
      .then(results => {
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
      })

      return privacyGroupId
  })

  .then(privacyGroupId => {

    // delete privacy group
    providerNode1.deletePrivacyGroup(privacyGroupId)
      .then(result => {
        console.log(result) // GcFhoLY7EMQg7jxJDC6Aei1GZTN/ZaRepptX48VcUBk=
      })
  })


