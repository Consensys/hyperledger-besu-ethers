# Ethers.js for Hyperledger Besu

[![npm version](https://badge.fury.io/js/hyperledger-besu-ethers.svg)](https://badge.fury.io/js/hyperledger-besu-ethers)

An extension of Richard Moore's excellent [Ethers.js](https://docs.ethers.io/ethers.js/html/)
Ethereum JavaScript library that adds support for [Hyperledger Besu's private transactions](https://besu.hyperledger.org/en/latest/Concepts/Privacy/Privacy-Overview/)
and [Hyperledger Besu](https://besu.hyperledger.org/en/latest/#what-is-hyperledger-besu)'s extended APIs like
[Admin](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#admin-methods), 
[Clique](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#clique-methods), 
[IBFT 2.0](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#ibft-20-methods), 
[Permissioning](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#permissioning-methods) and 
[Txpool](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#txpool-methods) 
JSON-RPC APIs.

- [Disclaimer](#disclaimer)
- [Install](#install)
- [Usage - Private Transaction](#usage---private-transaction)
  * [New Private Classes](#new-private-classes)
  * [Privacy Group Management](#privacy-group-management)
  * [Privacy Group Limitations](#privacy-group-limitations)
- [Usage - Besu APIs](#usage---besu-apis)
  * [Administration](#administration)
  * [Clique](#clique)
  * [IBFT 2.0](#ibft-20)
  * [Permissioning](#permissioning)
  * [Txpool](#txpool)
- [Hyperledger Besu](#hyperledger-besu)
  * [Web3.js](#web3js)
- [Ethers.js](#ethersjs)
- [Development](#development)
  * [Build](#build)
  * [Test](#test)
  * [Publish](#publish)

# Disclaimer

This library uses Ethers.js version 5 which is still in experimental status. It is not yet ready for production use. See [Ethers.js](#ethersjs) for more details.

Besu's new privacy features are not ready for production use. See [Privacy Group Limitations](#privacy-group-limitations) for more details.

# Install

Until hyperledger-besu-ethers is published on npm using the PegaSysEng account, installs will have to be done from this git repository.
```bash
npm install PegaSysEng/hyperledger-besu-ethers
```

# Usage - Private Transaction

Besu's private transactions are based off
[Enterprise Ethereum Alliance's](https://entethalliance.org/) 
[Ethereum Client Specification](https://entethalliance.github.io/client-spec/spec.html) for 
[private transactions](https://entethalliance.github.io/client-spec/spec.html#sec-private-transactions).
At a high level, it adds the `privateFor`, `privateFrom` and `restriction` transaction properties to the JSON-RPC API calls. The spec is not yet finalised so hopefully it can be brought into line with the features Besu currently has and has planned in its roadmap.

Private transactions are supported by PegaSys's [Hyperledger Besu](https://besu.hyperledger.org/en/latest/) Ethereum client and J.P.Morgan's [Quorum](https://github.com/jpmorganchase/quorum) distributed ledger. Unfortunately, Quorum's and Hyperledger Besu's JSON-RPC interfaces for private transactions are different and both don't match the EEA specification, so this library only works with Hyperledger Besu and not Quorum.

## New Private Classes

See [Ethers.js version 5](https://docs.ethers.io/ethers.js/v5-beta/) documentation for details on how the Ethers.js library works. This section will just document the differences for private transactions.

New `PrivateJsonRpcProvider` provider that extends [JsonRpcProvider](https://docs.ethers.io/ethers.js/v5-beta/api-providers.html#jsonrpcsigner) and implements the `PrivateProvider` interface
```ts
export interface PrivateProvider extends Provider {
    sendPrivateTransaction(signedTransaction: string | Promise<string>): Promise<PrivateTransactionResponse>,
    getPrivateTransactionCount(addressOrName: string | Promise<string>, privacyGroupOptions: PrivacyGroupOptions): Promise<number>,
    getPrivateTransactionReceipt(publicTransactionHash: string): Promise<PrivateTransactionReceipt>,
    getPrivateTransaction(transactionHash: string): Promise<PrivateTransactionResponse>

    // Privacy Group functions
    createPrivacyGroup(addresses: string[] | Promise<string[]>, name?: string | Promise<string>, description?: string | Promise<string>): Promise<string>,
    deletePrivacyGroup(privacyGroupId: string | Promise<string>): Promise<string>,
    findPrivacyGroup(members: string[] | Promise<string[]>): Promise<FindPrivacyGroup[]>,
    getPrivacyPrecompileAddress(): Promise<string>
}
```

New `PrivateWallet` that extends [Wallet](https://docs.ethers.io/ethers.js/v5-beta/api-wallet.html#wallet) and implements the `PrivateSigner` interace
```ts
export interface PrivateSigner extends Signer {
    readonly provider: PrivateProvider;
    privateCall(transaction: PrivateTransactionRequest): Promise<string>;
    signPrivateTransaction(transaction: PrivateTransactionRequest): Promise<string>;
    sendPrivateTransaction(transaction: PrivateTransactionRequest): Promise<PrivateTransactionResponse>;
}
```

The `PrivateUnsignedTransaction`, `PrivateTransaction`, `PrivateTransactionRequest` interfaces have the following privacy fields added to them.
```ts
    privateFrom?: string;
    privateFor?: string | string[];
    restriction?: 'restricted' | 'unrestricted';
```

See [privateTransactions.js](./examples/privateTransactions.js) for a full example of how a private contract can be deployed and its functions called from different nodes. Here's a short summary using the [Simple Storage](./src/contracts/SimpleStorage.sol) contract.
```js
const BesuEthers = require('hyperledger-besu-ethers')

// Create providers pointing to node 1 in the Privacy Enabled Quickstart Tutorial
const providerNode1 = new BesuEthers.providers.PrivateJsonRpcProvider("http://localhost:20000");

// Create a privacy group for nodes 1 and 2. Node 3 will not see the private contract
const privacyGroupId = await providerNode1.createPrivacyGroup(
    ['A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=', 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='],
    'Name of top secret group',
    'Description of super secret group')

// Create a wallet which will have address 0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF
const walletNode1 = new BesuEthers.PrivateWallet('0x0000000000000000000000000000000000000000000000000000000000000002', providerNode1)

// Simple Storage contract application programming interface (ABI) and Ethereum virtual machine (EVM) byte code
const abi = [{"constant":false,"inputs":[{"name":"x","type":"uint256"}],"name":"set","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"get","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]
const bytecode = '6080604052348015600f57600080fd5b5060ab8061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806360fe47b11460375780636d4ce63c146053575b600080fd5b605160048036036020811015604b57600080fd5b5035606b565b005b60596070565b60408051918252519081900360200190f35b600055565b6000549056fea265627a7a72305820b53c3a12a533365b0624ed636be47997f66ab3082086dde2044ab5b5e529c2fd64736f6c634300050a0032'

// PrivateContractFactory is like Ethers ContractFactory
const factory = new BesuEthers.PrivateContractFactory(abi, bytecode, walletNode1);

// Deploy a private contract using an existing privacy group
const contractNode1 = await factory.privateDeploy({privateFor: privacyGroupId});

// wait until the contract has been deployed
const deployReceipt = await contractNode1.deployPrivateTransaction.wait()

// Send a transaction to call the set function on the SimpleStorage contract
let tx = await contractNode1.set(666)

// Wait for the transaction to be mined. This returns a transaction receipt
await tx.wait()

// Read the stored value back
const value = await contractNode1.get()
```

More examples are in the [src/ts/\_\_tests__/contract.test.ts](./src/ts/__tests__/contract.test.ts) unit tests.

## Privacy Group Management

Create, find and delete a [privacy group](https://besu.hyperledger.org/en/latest/Concepts/Privacy/Privacy-Groups/).

Full code examples using promises [examples/privacyGroupManagementPromises.js](./examples/privacyGroupManagementPromises.js) or async/await [example/privacyGroupManagementAsync.js](./examples/privacyGroupManagementAsync.js) work against the [Privacy Enabled Quickstart Tutorial](https://besu.hyperledger.org/en/latest/Tutorials/Quickstarts/Privacy-Quickstart/).

The `PrivateJsonRpcProvider` used in the below examples can be instantiated with
```js
const providers = require('hyperledger-besu-ethers').providers
const provider = new providers.PrivateJsonRpcProvider("http://localhost:20000");
```

### Create a new privacy group - [priv_createPrivacyGroup](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#priv_createprivacygroup)
```js
  const privacyGroupId = await provider.createPrivacyGroup(
    ['A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=', 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='],
    'Name of group',
    'Description of top secret group')
  console.log(privacyGroupId) // GcFhoLY7EMQg7jxJDC6Aei1GZTN/ZaRepptX48VcUBk=
```

### Find privacy groups - [priv_findPrivacyGroup](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#priv_findprivacygroup)
```js
  const results = await provider.findPrivacyGroup(['A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=', 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='])
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
```

### Delete privacy group - [priv_deletePrivacyGroup](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#priv_deleteprivacygroup)
```js
  const deletedId = await provider.deletePrivacyGroup(privacyGroupId)
  console.log(deletedId) // GcFhoLY7EMQg7jxJDC6Aei1GZTN/ZaRepptX48VcUBk=
```

## Privacy Group Limitations

There are a number of limitations in the Besu 1.2 release that is being addressed in future releases:
* There is no way to check if a private transaction succeeded or failed as there is no `status` or `gasUsed` fields on the private transaction receipt.
* Calling read-only functions are done via sending a signed transaction as there is no equivalent of [eth_call](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#eth_call) for private transactions.
* Private transactions default to 10 million gas limit as there is no equivalent of [eth_estimateGas](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#eth_estimategas) to estimate the gas of a private transaction. This gas limit can be overridden via Ethers.js' optional override object.
* The client must wait until a contract has been mined before calling a contract method. Ethers.js supports calling function methods before a deployed contract has been mined by polling [eth_getCode](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#eth_getcode). There is no equivalent method for private transactions.
* You can't get events from private transactions as there is no equivalent of [getLogs](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#eth_getlogs) for private transactions.
* You can not add/remove nodes to/from a privacy group.

# Usage - Besu APIs

A new `BesuProvider` provider that extends the new `PrivateJsonRpcProvider` class adds the Besu specifics APIs that are not to do with private transactions. eg Admin, Clique, IBFT, Txpool.

The `BesuProvider` used in the below examples can be instantiated with
```js
const providers = require('hyperledger-besu-ethers').providers
const provider = new providers.BesuProvider("http://localhost:20000");
```

## Administration

Calls Hyperledger Besu's [administration](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#admin-methods) JSON-RPC APIs.
See [examples/admin.js](./examples/admin.js) for the full example code using async/await.

The admin methods require the `ADMIN` API methods to be enabled by Hyperledger Besu's [--rpc-http-api](http://besu.hyperledger.org/en/latest/Reference/CLI/CLI-Syntax/#rpc-http-api) command line option.

### Get module versions - [rpc_modules](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#rpc_modules)
```js
const moduleVersions = await provider.getModuleVersions()
console.log(moduleVersions) // {eea: '1.0', web3: '1.0', eth: '1.0', admin: '1.0', priv: '1.0', net: '1.0'}
```

### Change log level - [admin_changeLogLevel](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#admin_changeloglevel)

See [logging](https://besu.hyperledger.org/en/latest/Reference/CLI/CLI-Syntax/#logging) for the allowed log levels.
```js
await provider.changeLogLevel('TRACE')
```

### Get node information - [admin_nodeInfo](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#admin_nodeinfo)
```js
const nodeInfo = await provider.getNodeInfo()
console.log(nodeInfo)
/*
{ enode:
   'enode://192f022ba160677f05283443a6e548551b95faebbce659823cacd87489401f914bf34cd61f4905c0e6c19ea4ccd0cb91aa45041536f1e7f759e8caa323a148cc@127.0.0.1:30303',
  listenAddr: '127.0.0.1:30303',
  ip: '127.0.0.1',
  name: 'besu/v1.3.0/linux-x86_64/oracle_openjdk-java-11',
  id:
   '192f022ba160677f05283443a6e548551b95faebbce659823cacd87489401f914bf34cd61f4905c0e6c19ea4ccd0cb91aa45041536f1e7f759e8caa323a148cc',
  ports: { discovery: 30303, listener: 30303 },
  protocols:
   { eth:
      { config: [Object],
        difficulty: 65536,
        genesis:
         '0xa08d1edb37ba1c62db764ef7c2566cbe368b850f5b3762c6c24114a3fd97b87f',
        head:
         '0xa08d1edb37ba1c62db764ef7c2566cbe368b850f5b3762c6c24114a3fd97b87f',
        network: 2018 } } }
*/
```

### Get peers - [admin_peers](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#admin_peers)
```js
const peers = await provider.getPeers()
console.log(peers)
/*
[ { version: '0x5',
    name: 'besu/v1.3.0/linux-x86_64/oracle_openjdk-java-11',
    caps: [ 'eth/62', 'eth/63' ],
    network:
     { localAddress: '172.21.0.9:30303',
       remoteAddress: '172.21.0.5:50758' },
    port: '0x765f',
    id:
     '0x048781b21b8df1d29fc93b7f47a1e6483be25dc2442f2f0f42514d13b43853a1d37a8b6a8ef4178bf02a2d65b60292e47f0df224c6c92764e664c7275f43aad3' },
  { version: '0x5',
    name: 'besu/v1.3.0/linux-x86_64/oracle_openjdk-java-11',
    caps: [ 'eth/62', 'eth/63' ],
    network:
     { localAddress: '172.21.0.9:54614',
       remoteAddress: '172.21.0.10:30303' },
    port: '0x765f',
    id:
     '0xcdaaefe4e76f5ca77b5a365baab2f81e585ddad4ff8b21052420b653b3f736af8a300a8497cac63d3ad6cdefcec01463e9119ace11cec52ccb9d4b3325990870' } ]
*/
```

### Remove peer - [admin_removePeer](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#admin_removePeer)
```js
const success = await provider.removePeer("enode://af80b90d25145da28c583359beb47b21796b2fe1a23c1511e443e7a64dfdb27d7434c380f0aa4c500e220aa1a9d068514b1ff4d5019e624e7ba1efe82b340a59@127.0.0.1:30304")
console.log(success)  // true
```

### Add peer - [admin_addPeer](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#admin_addPeer)
```js
const success = await provider.addPeer("enode://af80b90d25145da28c583359beb47b21796b2fe1a23c1511e443e7a64dfdb27d7434c380f0aa4c500e220aa1a9d068514b1ff4d5019e624e7ba1efe82b340a59@127.0.0.1:30304")
console.log(success)  // true
```

## Clique

Calls Hyperledger Besu's [Clique](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#clique-methods) JSON-RPC APIs.
See [examples/clique.js](./examples/clique.js) for the full example code using async/await.

The Clique methods require the `CLIQUE` API methods to be enabled by Hyperledger Besu's [--rpc-http-api](https://besu.hyperledger.org/en/latest/Reference/CLI/CLI-Syntax/#rpc-http-api) command line option.

### Get Signers - [clique_getSigners](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#clique_getSigners)
```js
const signers = await provider.cliqueGetSigners('latest')
console.log(signers)
// [ "0x42eb768f2244c8811c63729a21a3569731535f06", "0x7ffc57839b00206d1ad20c69a1981b489f772031", "0xb279182d99e65703f0076e4812653aab85fca0f0" ]
```

### Get Signers at hash - [clique_getSignersAtHash](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#clique_getsignersathash)
```js
const signers = await provider.cliqueGetSignersAtHash('0x98b2ddb5106b03649d2d337d42154702796438b3c74fd25a5782940e84237a48')
console.log(signers)
// [ "0x42eb768f2244c8811c63729a21a3569731535f06", "0x7ffc57839b00206d1ad20c69a1981b489f772031", "0xb279182d99e65703f0076e4812653aab85fca0f0" ]
```

### Propose Signer - [clique_propose](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#clique_propose)
```js
const success = await provider.cliquePropose("0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73", true)
console.log(success)  // true
```

### Discard Proposal - [clique_discard](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#clique_discard)
```js
const success = await provider.cliqueDiscard("0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73")
console.log(success)  // true
```

### Get Proposals - [clique_proposals](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#clique_proposals)
```js
const proposals = await provider.cliqueGetProposals()
console.log(proposals)
/*
{
    "0x42eb768f2244c8811c63729a21a3569731535f07": false,
    "0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73": true
}
*/
```

## IBFT 2.0

Calls Hyperledger Besu's [IBFT 2.0](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#ibft-20-methods) JSON-RPC APIs.
See [examples/IBFT.js](./examples/IBFT.js) for the full example code using async/await.

The IBFT methods require the `IBFT` API methods to be enabled by Hyperledger Besu's [--rpc-http-api](https://besu.hyperledger.org/en/latest/Reference/CLI/CLI-Syntax/#rpc-http-api) command line option.

### Get Validators by block parameter - [ibft_getValidatorsByBlockNumber](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#ibft_getvalidatorsbyblocknumber)
See [Block Number](https://besu.hyperledger.org/en/latest/HowTo/Interact/APIs/Using-JSON-RPC-API/#block-parameter) for allowed parameter values.
```js
const validators = await provider.ibftGetValidatorsByBlockNumber('latest')
console.log(validators)
// [ "0x42d4287eac8078828cf5f3486cfe601a275a49a5", "0xb1b2bc9582d2901afdc579f528a35ca41403fa85", "0xef1bfb6a12794615c9b0b5a21e6741f01e570185" ]
```

### Get Validators at hash - [ibft_getValidatorsByBlockHash](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#ibft_getvalidatorsbyblockhash)
```js
const validators = await provider.ibftGetValidatorsByBlockHash('0xbae7d3feafd743343b9a4c578cab5e5d65eb735f6855fb845c00cab356331256')
console.log(validators)
// [ "0x42d4287eac8078828cf5f3486cfe601a275a49a5", "0xb1b2bc9582d2901afdc579f528a35ca41403fa85", "0xef1bfb6a12794615c9b0b5a21e6741f01e570185" ]
```

### Propose Validator Vote - [ibft_proposeValidatorVote](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#ibft_proposevalidatorvote)
```js
const success = await provider.ibftProposeValidatorVote("0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73", true)
console.log(success)  // true
```

### Discard Validator Vote - [ibft_discardValidatorVote](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#ibft_discardvalidatorvote)
```js
const success = await provider.ibftDiscardValidatorVote("0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73")
console.log(success)  // true
```

### Get Validator Votes - [ibft_getPendingVotes](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#ibft_getpendingvotes)
```js
const validatorVotes = await provider.ibftGetPendingVotes()
console.log(validatorVotes)
/*
  {
    "0x42eb768f2244c8811c63729a21a3569731535f07": false,
    "0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73": true
  }
*/
```
## Permissioning

Calls Hyperledger Besu's [permissioning](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#permissioning-methods) JSON-RPC APIs.
See [examples/permissioning.js](./examples/permissioning.js) for the full example code using async/await.

The local permissioning methods require the `PERM` API methods to be enabled by Hyperledger Besu's [--rpc-http-api](https://besu.hyperledger.org/en/latest/Reference/CLI/CLI-Syntax/#rpc-http-api) command line option.

Hyperledger Besu's account and node whitelists also need to be configured for the below API calls to work. See Hyperledger Besu [Local Permissioning](https://besu.hyperledger.org/en/latest/Permissions/Local-Permissioning/) documentation for how to do this.

### Add Accounts To Whitelist - [perm_addAccountsToWhitelist](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#perm_addaccountstowhitelist)
```js
const result = await provider.addAccountsToWhitelist(["0xb9b81ee349c3807e46bc71aa2632203c5b462032", "0xb9b81ee349c3807e46bc71aa2632203c5b462034"])
console.log(result) // Success
```

### Get Accounts on Whitelist - [perm_getAccountsWhitelist](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#perm_getaccountswhitelist)
```js
const accounts = await provider.getAccountsWhitelist()
console.log(accounts) // ["0xb9b81ee349c3807e46bc71aa2632203c5b462032", "0xb9b81ee349c3807e46bc71aa2632203c5b462034"]
```

### Remove Accounts To Whitelist - [perm_removeAccountsFromWhitelist](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#perm_removeAccountsfromwhitelist)
```js
const result = await provider.removeAccountsFromWhitelist(["0xb9b81ee349c3807e46bc71aa2632203c5b462032", "0xb9b81ee349c3807e46bc71aa2632203c5b462034"])
console.log(result) // Success
```

### Add Nodes To Whitelist - [perm_addNodesToWhitelist](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#perm_addnodestowhitelist)
```js
const result = await provider.addNodesToWhitelist(["enode://7e4ef30e9ec683f26ad76ffca5b5148fa7a6575f4cfad4eb0f52f9c3d8335f4a9b6f9e66fcc73ef95ed7a2a52784d4f372e7750ac8ae0b544309a5b391a23dd7@127.0.0.1:30303","enode://2feb33b3c6c4a8f77d84a5ce44954e83e5f163e7a65f7f7a7fec499ceb0ddd76a46ef635408c513d64c076470eac86b7f2c8ae4fcd112cb28ce82c0d64ec2c94@127.0.0.1:30304"])
console.log(result) // Success
```

### Get Nodes on Whitelist - [perm_getNodesWhitelist](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#perm_getnodeswhitelist)
```js
const nodes = await provider.getNodesWhitelist()
console.log(nodes) 
/* [
  "enode://7b61d5ee4b44335873e6912cb5dd3e3877c860ba21417c9b9ef1f7e500a82213737d4b269046d0669fb2299a234ca03443f25fe5f706b693b3669e5c92478ade@127.0.0.1:30305",
  "enode://2feb33b3c6c4a8f77d84a5ce44954e83e5f163e7a65f7f7a7fec499ceb0ddd76a46ef635408c513d64c076470eac86b7f2c8ae4fcd112cb28ce82c0d64ec2c94@127.0.0.1:30304"
] */
```

### Remove Nodes To Whitelist - [perm_removeNodesFromWhitelist](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#perm_removenodesfromwhitelist)
```js
const result = await provider.removeNodesFromWhitelist(["enode://7e4ef30e9ec683f26ad76ffca5b5148fa7a6575f4cfad4eb0f52f9c3d8335f4a9b6f9e66fcc73ef95ed7a2a52784d4f372e7750ac8ae0b544309a5b391a23dd7@127.0.0.1:30303","enode://2feb33b3c6c4a8f77d84a5ce44954e83e5f163e7a65f7f7a7fec499ceb0ddd76a46ef635408c513d64c076470eac86b7f2c8ae4fcd112cb28ce82c0d64ec2c94@127.0.0.1:30304"])
console.log(result) // Success
```

### Reload Permissions From File - [perm_reloadPermissionsFromFile](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#perm_reloadpermissionsfromfile)
```js
const result = await provider.reloadPermissionsFromFile()
console.log(result) // Success
```

## Txpool

The txpool methods require the `TXPOOL` API methods to be enabled by Hyperledger Besu's [--rpc-http-api](https://besu.hyperledger.org/en/latest/Reference/CLI/CLI-Syntax/#rpc-http-api) command line option.

### Besu Statistics - [txpool_besuStatistics](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#txpool_besustatistics)
```js
const stats = await provider.getBesuStatistics()
console.log(stats)  // {"maxSize": 4096, "localCount": 1, "remoteCount": 0}
```

### Besu Transactions - [txpool_besuTransactions](https://besu.hyperledger.org/en/latest/Reference/API-Methods/#txpool_besutransactions)
```js
const results = await provider.getBesuTransactions()
console.log(results)
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
```

# Hyperledger Besu

[Hyperledger Besu](https://besu.hyperledger.org/en/latest/#what-is-hyperledger-besu) is an open-source Ethereum client written in Java. It runs on the Ethereum public network, private networks, and test networks such as Rinkeby, Ropsten, and Görli. Hyperledger Besu implements Proof of Work (Ethash) and Proof of Authority (IBFT 2.0 and Clique) consensus mechanisms.

This library will only work against [Hyperledger Besu 1.3.0](https://github.com/hyperledger/besu/releases/tag/1.3.0) and above. It will not work against the 1.2.xPa releases. 
The library uses Hyperledger Besu's [JSON-RPC APIs](https://besu.hyperledger.org/en/latest/Reference/API-Methods/) over HTTP.

See [Privacy Overview](https://besu.hyperledger.org/en/latest/Concepts/Privacy/Privacy-Overview/) for more details on how Hyperledger Besu supports private transactions.

[Private Network with Privacy Enabled Quickstart Tutorial](https://besu.hyperledger.org/en/latest/Tutorials/Quickstarts/Privacy-Quickstart/) steps through setting up a three node private network managed by Docker Compose. The TL;DR version is
```bash
git clone https://github.com/PegaSysEng/besu-quickstart.git
cd besu-quickstart/privacy
./run.sh
```

You can see the logs from the nodes running on docker-compose with
```bash
./list.sh   # lists the status of the docker servers. ie are they up or down
./logs.sh   # tail the logs of each of the docker services
./stop.sh   # shuts down all of the docker services
./remove.sh # stops and then removes the server volumes so the chain will start back at block 0
```

A blockchain explorer will be at http://localhost:32768

To tail the logs of a specific docker service. eg node 1
```bash
docker-compose logs -f node1 orion1
```

To list the cpu and memory used by each container
```bash
docker ps -q | xargs  docker stats --no-stream
```

To bash into the to the Hyperledger Besu image used by the quickstart
```bash
docker run -it --entrypoint=sh quickstart/besu:develop-privacy
```

To bash into a running docker-compose service. eg node1
```bash
docker-compose exec node1 sh
```

To pull the latest Hyperledger Besu and Orion docker images from the `develop` branch and build a `quickstart/besu:develop-privacy` image
```bash
cd privacy
docker image pull hyperledger/besu:develop
docker-compose build bootnode
docker-compose build --pull orion1
```

The Hyperledger Besu tags for the Docker images can be found at https://hub.docker.com/r/hyperledger/besu/tags

There are three pre-funded accounts if you run Hyperledger Besu in dev mode. See the `alloc` section in https://github.com/hyperledger/besu/blob/master/config/src/main/resources/dev.json

## Web3.js

Hyperledger Besu has an [EEA JavaScript library](https://github.com/PegaSysEng/web3js-eea#eea-javascript-libraries---eeajs) that is an extension of the [Web3.js](https://web3js.readthedocs.io/en/1.0/) JavaScript library. The EEA JavaScript library is an alternative to this Ethers.js extended library. It can also be used as a reference to how Hyperledger Besu privacy transactions are encoded.
The EEA Web3js library does not include the Hyperledger Besu extended APIs like admin, clique, ibft, txpool, perm and priv.


# Ethers.js

Ethers.js version 5 is used as its modular packages makes it easier to extend the classes to add private transaction support. See Richard's blog on [Beta Release: ethers.js v5](https://blog.ricmoo.com/beta-release-ethers-js-v5-59d0db222d7b) for more details.

For regression testing purposes, ethers version 4 is also installed in the devDependencies. This uses an npm alias which is available from npm version 6.9.0. See (this)[https://stackoverflow.com/a/56495895/3144809] Stack Overflow answer for more information.
```bash
npm i ethers-4@npm:ethers@4.0.33
```

Ethers.js links
* [Version 5 Documentation](https://docs.ethers.io/ethers.js/v5-beta/)
* [Version 4 Documentation](https://docs.ethers.io/ethers.js/)
* [Version 5 code on branch ethers-v5-beta](https://github.com/ethers-io/ethers.js/tree/ethers-v5-beta)
* [Ethers Gitter](https://gitter.im/ethers-io/Lobby)

# Development

The following is only required if you are contributing to the develop of this library.

## Build

This library has been developed with TypeScript so it needs to be compiled to JavaScript with
```js
npm run build
```
This uses the [tsconfig.json](./tsconfig.json) TypeScript config file and outputs the JavaScript and type definition files to the [dist](./dist) folder.

### Solidity

The Solidity contracts used in the examples and tests can be compiled with the following.
```js
npm run buildSol
```
This uses the [scripts/buildSol.sh](./scripts/buildSol.sh) script which uses a locally installed Solidity compiler `solc`. The ABI and evm files from compilation are output to the [dist/abis](./dist/abis) folder.

See the Solidity documentation on how to install the [Solidity binary packages](https://solidity.readthedocs.io/en/latest/installing-solidity.html#binary-packages) on your operating system.

## Test

[Jest](https://jestjs.io/) is used to run the unit tests with the configuration in [jest.config.js](./jest.config.js)
```bash
jest --detectOpenHandles --forceExit --runInBand
```

## Publish

Before publishing a new package to [npm](https://www.npmjs.com/), bump the package version in [package.json](./package.json) and [src/ts/_version.ts](./src/ts/_version.ts).

The following will build, test and publish
```bash
npm run build
npm run test
npm publish
```

One way to test a new package before publishing it is to run `npm pack` and then update the examples to point to the created package file. eg `hyperledger-besu-ethers-0.0.4.tgz`. In [examples/package.json](./examples/package.json), change the `hyperledger-besu-ethers` dependency to point to the created package file. eg `"hyperledger-besu-ethers": "../hyperledger-besu-ethers-0.0.4.tgz"`.
You can then run an example.
```bash
npm pack
cd examples
node privateTransactions.js
```
