// This example works against the Private Network with Privacy Enabled Quickstart Tutorial
// https://besu.hyperledger.org/en/latest/Tutorials/Quickstarts/Privacy-Quickstart/
// Node.js 8 or above is required as async/await is used.
// Run the following to build the simple storage contract: npm run buildSol

const readFileSync = require("fs").readFileSync

const BesuEthers = require('hyperledger-besu-ethers')

// Create providers pointing to each of the nodes in the Privacy Enabled Quickstart Tutorial
const providerNode1 = new BesuEthers.providers.PrivateJsonRpcProvider("http://localhost:20000");
const providerNode2 = new BesuEthers.providers.PrivateJsonRpcProvider("http://localhost:20002");
const providerNode3 = new BesuEthers.providers.PrivateJsonRpcProvider("http://localhost:20004");

// The Orion address from the Privacy Enabled Quickstart Tutorial
const node1 = 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo='
const node2 = 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='

// Load the Application Binary Interface and EVM byte code from disk
const abi = readFileSync('../dist/abis/SimpleStorage.abi', 'utf8')
const bytecode = readFileSync('../dist/abis/SimpleStorage.bin', 'utf8')

async function example() {

  // Create a privacy group for nodes 1 and 2. Node 3 will not see the private contract
  const privacyGroupId = await providerNode1.createPrivacyGroup(
    [node1, node2],
    'Name of top secret group',
    'Description of super secret group')
  console.log(`Privacy group id ${privacyGroupId}`)
  // Privacy group id 662IDv06KQOjr11Qtev3xC8NIbyWztxHMSLcNqtk3Wo=

  // Create a wallet which will have address 0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF
  // Note any private key can be used. It doesn't have to be the private key of node 1
  // This is like an Ethers Wallet but will have extra private functions like sendPrivateTransaction
  // The wallet has a provider pointing to node 1
  const privateKey = '0x0000000000000000000000000000000000000000000000000000000000000002'
  const walletNode1 = new BesuEthers.PrivateWallet(privateKey, providerNode1)
  console.log(`Address of node 1 wallet ${walletNode1.address}`)
  // Address of node 1 wallet 0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF

  // PrivateContractFactory is like Ethers ContractFactory except it
  // creates PrivateContract classes instead of Ethers Contract classes
  const factory = new BesuEthers.PrivateContractFactory(abi, bytecode, walletNode1);

  // As we have already created a privacy group, we can set the privacy group Id in the privateFrom
  // Alternatively, the privateFrom can be an array of Orion addresses. eg [node1, node2]
  const contractNode1 = await factory.privateDeploy({
    privateFor: privacyGroupId
  });
  console.log(`Contract address of deployed private contract ${contractNode1.address}`)
  // Contract address of deployed private contract 0xfF4f11012BB3D1b66f6f78cA752d44f79c15c7eA
  console.log(`Public hash of deployment transactions ${contractNode1.deployPrivateTransaction.publicHash}`)
  // Public hash of deployment transactions 0x3cbf167313aa928821ae9792fc8a16be493fe3c7174e80a470194e262473438a

  // wait until the contract has been deployed
  const deployReceipt = await contractNode1.deployPrivateTransaction.wait()
  console.log(`Deployment transaction mined into block ${deployReceipt.blockNumber}`)
  // Deployment transaction mined into block 2954

  // Create a wallet with a provider pointing to node 2
  // I've used the same private key but it could be a different key
  const walletNode2 = new BesuEthers.PrivateWallet(privateKey, providerNode2)

  // Node 2 connects to the previously deployed contract
  const contractNode2 = new BesuEthers.PrivateContract(contractNode1.address, {privateFor: privacyGroupId}, abi, walletNode2)

  // Send a transaction to call the set function on the SimpleStorage contract
  let tx = await contractNode2.set(666)
  console.log(`Hash of node 2 tx to set storage value ${tx.publicHash}`)
  // Hash of node 2 tx to set storage value 0xa5af91c1d6d94087f204abd34084a48c79ead276f93d95db2138795d6fd830d3

  // Wait for the transaction to be mined. This returns the transaction receipt which
  // does not currently include the status field so we don't know if the transaction was successful or not
  await tx.wait()

  // Read the stored value back from node 1 which will be of Ethers BigNumber type
  const value = await contractNode1.get()
  console.log(`Read value from ${value} node 1`)
  // Read value 666 from node 1

  // Create a wallet with a provider pointing to node 3 which is not part of the privacy group
  const walletNode3 = new BesuEthers.PrivateWallet(privateKey, providerNode3)
  const contractNode3 = new BesuEthers.PrivateContract(contractNode1.address, {privateFor: privacyGroupId}, abi, walletNode3)

  // Try and read storage value from node 3 which is not part of the privacy group
  try {
    const valueNode3 = await contractNode3.get()
  }
  catch (err) {
    console.log(`Node 3 failed to read storage value as they are not part of the privacy group`)
  }
}

example()
