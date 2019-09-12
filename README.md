# Ethers.js for Pantheon

[![npm version](https://badge.fury.io/js/pantheon-ethers.svg)](https://badge.fury.io/js/pantheon-ethers)

An extension of Richard Moore's excellent [Ethers.js](https://docs.ethers.io/ethers.js/html/) Ethereum JavaScript library that adds support for [Pantheon's private transactions](https://docs.pantheon.pegasys.tech/en/latest/Privacy/Explanation/Privacy-Overview/) and [Pantheon](https://docs.pantheon.pegasys.tech/en/latest/#what-is-pantheon)'s extended APIs like
[Admin](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#admin-methods), 
[Clique](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#clique-methods), 
[IBFT 2.0](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#ibft-20-methods), 
[Permissioning](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#permissioning-methods) and 
[Txpool](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#txpool-methods) 
JSON-RPC APIs.

- [Disclaimer](#disclaimer)
- [Install](#install)
- [Usage - Private Transaction](#usage---private-transaction)
  * [New Private Classes](#new-private-classes)
  * [Privacy Group Management](#privacy-group-management)
  * [Privacy Group Limitations](#privacy-group-limitations)
- [Usage - Pantheon APIs](#usage---pantheon-apis)
  * [Pantheon Administration](#pantheon-administration)
  * [Clique](#clique)
  * [IBFT 2.0](#ibft-20)
  * [Permissioning](#permissioning)
  * [Txpool](#txpool)
- [Pantheon](#pantheon)
  * [Web3.js](#web3js)
- [Ethers.js](#ethersjs)
- [Development](#development)
  * [Build](#build)
  * [Test](#test)
  * [Publish](#publish)

# Disclaimer

This library uses Ethers.js version 5 which is still in experimental status. It is not yet ready for production use. See [Ethers.js](#ethersjs) for more details.

Pantheon's new privacy features are not ready for production use. See [Privacy Group Limitations](#privacy-group-limitations) for more details.

# Install

To install as a node module
```bash
npm install --production pantheon-ethers
```

# Usage - Private Transaction

Pantheon's private transactions are based off
[Enterprise Ethereum Alliance's](https://entethalliance.org/) 
[Ethereum Client Specification](https://entethalliance.github.io/client-spec/spec.html) for 
[private transactions](https://entethalliance.github.io/client-spec/spec.html#sec-private-transactions).
At a high level, it adds the `privateFor`, `privateFrom` and `restriction` transaction properties to the JSON-RPC API calls. The spec is not yet finalised so hopefully it can be brought into line with the features Pantheon currently has and has planned in its roadmap.

Private transactions are supported by PegaSys's [Pantheon](https://docs.pantheon.pegasys.tech/en/stable/) Ethereum client and J.P.Morgan's [Quorum](https://github.com/jpmorganchase/quorum) distributed ledger. Unfortunately, Quorum's and Pantheon's JSON-RPC interfaces for private transactions are different and both don't match the EEA specification, so this library only works with Pantheon and not Quorum.

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
const PanEthers = require('pantheon-ethers')

// Create providers pointing to node 1 in the Privacy Enabled Quickstart Tutorial
const providerNode1 = new PanEthers.providers.PrivateJsonRpcProvider("http://localhost:20000");

// Create a privacy group for nodes 1 and 2. Node 3 will not see the private contract
const privacyGroupId = await providerNode1.createPrivacyGroup(
    ['A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=', 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='],
    'Name of top secret group',
    'Description of super secret group')

// Create a wallet which will have address 0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF
const walletNode1 = new PanEthers.PrivateWallet('0x0000000000000000000000000000000000000000000000000000000000000002', providerNode1)

// Simple Storage contract application programming interface (ABI) and Ethereum virtual machine (EVM) byte code
const abi = [{"constant":false,"inputs":[{"name":"x","type":"uint256"}],"name":"set","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"get","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]
const bytecode = '6080604052348015600f57600080fd5b5060ab8061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806360fe47b11460375780636d4ce63c146053575b600080fd5b605160048036036020811015604b57600080fd5b5035606b565b005b60596070565b60408051918252519081900360200190f35b600055565b6000549056fea265627a7a72305820b53c3a12a533365b0624ed636be47997f66ab3082086dde2044ab5b5e529c2fd64736f6c634300050a0032'

// PrivateContractFactory is like Ethers ContractFactory
const factory = new PanEthers.PrivateContractFactory(abi, bytecode, walletNode1);

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

Create, find and delete a [privacy group](https://docs.pantheon.pegasys.tech/en/stable/Privacy/Explanation/Privacy-Groups/).

Full code examples using promises [examples/privacyGroupManagementPromises.js](./examples/privacyGroupManagementPromises.js) or async/await [example/privacyGroupManagementAsync.js](./examples/privacyGroupManagementAsync.js) work against the [Privacy Enabled Quickstart Tutorial](https://docs.pantheon.pegasys.tech/en/stable/Tutorials/Privacy-Quickstart/).

The `PrivateJsonRpcProvider` used in the below examples can be instantiated with
```js
const providers = require('pantheon-ethers').providers
const provider = new providers.PrivateJsonRpcProvider("http://localhost:20000");
```

### Create a new privacy group - [priv_createPrivacyGroup](https://docs.pantheon.pegasys.tech/en/stable/Reference/Pantheon-API-Methods/#priv_createprivacygroup)
```js
  const privacyGroupId = await provider.createPrivacyGroup(
    ['A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo=', 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='],
    'Name of group',
    'Description of top secret group')
  console.log(privacyGroupId) // GcFhoLY7EMQg7jxJDC6Aei1GZTN/ZaRepptX48VcUBk=
```

### Find privacy groups - [priv_findPrivacyGroup](https://docs.pantheon.pegasys.tech/en/stable/Reference/Pantheon-API-Methods/#priv_findprivacygroup)
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

### Delete privacy group - [priv_deletePrivacyGroup](https://docs.pantheon.pegasys.tech/en/stable/Reference/Pantheon-API-Methods/#priv_deleteprivacygroup)
```js
  const deletedId = await provider.deletePrivacyGroup(privacyGroupId)
  console.log(deletedId) // GcFhoLY7EMQg7jxJDC6Aei1GZTN/ZaRepptX48VcUBk=
```

## Privacy Group Limitations

There are a number of limitations in the Pantheon 1.2 release that is being addressed for the 1.3 release:
* There is no way to check if a private transaction succeeded or failed as there is no `status` or `gasUsed` fields on the private transaction receipt.
* Calling read-only functions are done via sending a signed transaction as there is no equivalent of [eth_call](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#eth_call) for private transactions.
* Private transactions default to 10 million gas limit as there is no equivalent of [eth_estimateGas](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#eth_estimategas) to estimate the gas of a private transaction. This gas limit can be overridden via Ethers.js' optional override object.
* The client must wait until a contract has been mined before calling a contract method. Ethers.js supports calling function methods before a deployed contract has been mined by polling [eth_getCode](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#eth_getcode). There is no equivalent method for private transactions.
* You can't get events from private transactions as there is no equivalent of [getLogs](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#eth_getlogs) for private transactions.
* You can not add/remove nodes to/from a privacy group.

# Usage - Pantheon APIs

A new `PantheonProvider` provider that extends the new `PrivateJsonRpcProvider` class adds the Pantheon specifics APIs that are not to do with private transactions. eg Admin, Clique, IBFT, Txpool.

The `PantheonProvider` used in the below examples can be instantiated with
```js
const providers = require('pantheon-ethers').providers
const provider = new providers.PantheonProvider("http://localhost:20000");
```

## Pantheon Administration

Calls Pantheon's [administration](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#admin-methods) JSON-RPC APIs.
See [examples/pantheonAdmin.js](./examples/pantheonAdmin.js) for the full example code using async/await.

The admin methods require the `ADMIN` API methods to be enabled by Pantheon's [--rpc-http-api](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-CLI-Syntax/) command line option.

### Get module versions - [rpc_modules](https://docs.pantheon.pegasys.tech/en/stable/Reference/Pantheon-API-Methods/#rpc_modules)
```js
const moduleVersions = await provider.getModuleVersions()
console.log(moduleVersions) // {eea: '1.0', web3: '1.0', eth: '1.0', admin: '1.0', priv: '1.0', net: '1.0'}
```

### Change log level - [admin_changeLogLevel](https://docs.pantheon.pegasys.tech/en/stable/Reference/Pantheon-API-Methods/#admin_changeloglevel)

See [logging](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-CLI-Syntax/#logging) for the allowed log levels.
```js
await provider.changeLogLevel('TRACE')
```

### Get node information - [admin_nodeInfo](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#admin_nodeinfo)
```js
const nodeInfo = await provider.getNodeInfo()
console.log(nodeInfo)
/*
{ enode: 'enode://09b02f8a5fddd222ade4ea4528faefc399623af3f736be3c44f03e2df22fb792f3931a4d9573d333ca74343305762a753388c3422a86d98b713fc91c1ea04842@127.0.0.1:30303',
  listenAddr: '127.0.0.1:30303',
  ip: '127.0.0.1',
  name: 'pantheon/v1.2.1-dev-09c1da96/linux-x86_64/oracle_openjdk-java-11',
  id: '09b02f8a5fddd222ade4ea4528faefc399623af3f736be3c44f03e2df22fb792f3931a4d9573d333ca74343305762a753388c3422a86d98b713fc91c1ea04842',
  ports: { discovery: 30303, listener: 30303 },
  protocols:
   { eth:
      { config:
        { chainId: 2018,
          homesteadBlock: 0,
          eip150Block: 0,
          eip155Block: 0,
          eip158Block: 0,
          byzantiumBlock: 0,
          constantinopleBlock: 0,
          constantinopleFixBlock: 0,
          contractSizeLimit: 2147483647,
          ethash: { fixeddifficulty: 100 } },
        difficulty: 66736,
        genesis: '0xa08d1edb37ba1c62db764ef7c2566cbe368b850f5b3762c6c24114a3fd97b87f',
        head: '0x30b29790ae4e6e16c299bbb1b60e3df77041e8502a86d50fbb99122fbbad5293',
        network: 2018 } } }
*/
```

### Get peers - [admin_peers](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#admin_peers)
```js
const peers = await provider.getPeers()
console.log(peers)
/*
[ { version: '0x5',
    name: 'pantheon/v1.2.1-dev-09c1da96/linux-x86_64/oracle_openjdk-java-11',
    caps: [ 'eth/62', 'eth/63' ],
    network:
     { localAddress: '172.20.0.10:51054',
       remoteAddress: '172.20.0.5:30303' },
    port: '0x765f',
    id: '0x5506b499b8105e4caff8e08fc912dd5cdf26bbff6f292f0ccea7c276364e071fb639b60062a0b1715f9e94519a583445ec7a584532ccebf513fe905b94393760' },
  { version: '0x5',
    name: 'pantheon/v1.2.1-dev-09c1da96/linux-x86_64/oracle_openjdk-java-11',
    caps: [ 'eth/62', 'eth/63' ],
    network:
     { localAddress: '172.20.0.10:34662',
       remoteAddress: '172.20.0.8:30303' },
    port: '0x765f',
    id: '0x0cd6125df42a7d90b0e4a509c9ef54d7791b71b9f08b5e9e9d4d52ff8441bfcdeda61cd1f975db9fdd71f43248baa7d204d316ff36794f072fd66505b272261a' } ]
*/
```

### Remove peer - [admin_removePeer](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#admin_removePeer)
```js
const success = await provider.removePeer("enode://af80b90d25145da28c583359beb47b21796b2fe1a23c1511e443e7a64dfdb27d7434c380f0aa4c500e220aa1a9d068514b1ff4d5019e624e7ba1efe82b340a59@127.0.0.1:30304")
console.log(success)  // true
```

### Add peer - [admin_addPeer](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#admin_addPeer)
```js
const success = await provider.addPeer("enode://af80b90d25145da28c583359beb47b21796b2fe1a23c1511e443e7a64dfdb27d7434c380f0aa4c500e220aa1a9d068514b1ff4d5019e624e7ba1efe82b340a59@127.0.0.1:30304")
console.log(success)  // true
```

## Clique

Calls Pantheon's [Clique](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#clique-methods) JSON-RPC APIs.
See [examples/pantheonClique.js](./examples/pantheonClique.js) for the full example code using async/await.

The Clique methods require the `CLIQUE` API methods to be enabled by Pantheon's [--rpc-http-api](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-CLI-Syntax/) command line option.

### Get Signers - [clique_getSigners](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#clique_getSigners)
```js
const signers = await provider.cliqueGetSigners('latest')
console.log(signers)
// [ "0x42eb768f2244c8811c63729a21a3569731535f06", "0x7ffc57839b00206d1ad20c69a1981b489f772031", "0xb279182d99e65703f0076e4812653aab85fca0f0" ]
```

### Get Signers at hash - [clique_getSignersAtHash](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#clique_getsignersathash)
```js
const signers = await provider.cliqueGetSignersAtHash('0x98b2ddb5106b03649d2d337d42154702796438b3c74fd25a5782940e84237a48')
console.log(signers)
// [ "0x42eb768f2244c8811c63729a21a3569731535f06", "0x7ffc57839b00206d1ad20c69a1981b489f772031", "0xb279182d99e65703f0076e4812653aab85fca0f0" ]
```

### Propose Signer - [clique_propose](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#clique_propose)
```js
const success = await provider.cliquePropose("0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73", true)
console.log(success)  // true
```

### Discard Proposal - [clique_discard](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#clique_discard)
```js
const success = await provider.cliqueDiscard("0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73")
console.log(success)  // true
```

### Get Proposals - [clique_proposals](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#clique_proposals)
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

Calls Pantheon's [IBFT 2.0](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#ibft-20-methods) JSON-RPC APIs.
See [examples/pantheonIBFT.js](./examples/pantheonIBFT.js) for the full example code using async/await.

The IBFT methods require the `IBFT` API methods to be enabled by Pantheon's [--rpc-http-api](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-CLI-Syntax/) command line option.

### Get Validators by block parameter - [ibft_getValidatorsByBlockNumber](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#ibft_getvalidatorsbyblocknumber)
See [Block Number](https://docs.pantheon.pegasys.tech/en/latest/Pantheon-API/Using-JSON-RPC-API/#block-parameter) for allowed parameter values.
```js
const validators = await provider.ibftGetValidatorsByBlockNumber('latest')
console.log(validators)
// [ "0x42d4287eac8078828cf5f3486cfe601a275a49a5", "0xb1b2bc9582d2901afdc579f528a35ca41403fa85", "0xef1bfb6a12794615c9b0b5a21e6741f01e570185" ]
```

### Get Validators at hash - [ibft_getValidatorsByBlockHash](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#ibft_getvalidatorsbyblockhash)
```js
const validators = await provider.ibftGetValidatorsByBlockHash('0xbae7d3feafd743343b9a4c578cab5e5d65eb735f6855fb845c00cab356331256')
console.log(validators)
// [ "0x42d4287eac8078828cf5f3486cfe601a275a49a5", "0xb1b2bc9582d2901afdc579f528a35ca41403fa85", "0xef1bfb6a12794615c9b0b5a21e6741f01e570185" ]
```

### Propose Validator Vote - [ibft_proposeValidatorVote](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#ibft_proposevalidatorvote)
```js
const success = await provider.ibftProposeValidatorVote("0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73", true)
console.log(success)  // true
```

### Discard Validator Vote - [ibft_discardValidatorVote](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#ibft_discardvalidatorvote)
```js
const success = await provider.ibftDiscardValidatorVote("0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73")
console.log(success)  // true
```

### Get Validator Votes - [ibft_getPendingVotes](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#ibft_getpendingvotes)
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

Calls Pantheon's [permissioning](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#permissioning-methods) JSON-RPC APIs.
See [examples/pantheonPermissioning.js](./examples/pantheonPermissioning.js) for the full example code using async/await.

The local permissioning methods require the `PERM` API methods to be enabled by Pantheon's [--rpc-http-api](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-CLI-Syntax/) command line option.

Pantheon's account and node whitelists also need to be configured for the below API calls to work. See Pantheon [Local Permissioning](https://docs.pantheon.pegasys.tech/en/latest/Permissions/Local-Permissioning/) documentation for how to do this.

### Add Accounts To Whitelist - [perm_addAccountsToWhitelist](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#perm_addaccountstowhitelist)
```js
const result = await provider.addAccountsToWhitelist(["0xb9b81ee349c3807e46bc71aa2632203c5b462032", "0xb9b81ee349c3807e46bc71aa2632203c5b462034"])
console.log(result) // Success
```

### Get Accounts on Whitelist - [perm_getAccountsWhitelist](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#perm_getaccountswhitelist)
```js
const accounts = await provider.getAccountsWhitelist()
console.log(accounts) // ["0xb9b81ee349c3807e46bc71aa2632203c5b462032", "0xb9b81ee349c3807e46bc71aa2632203c5b462034"]
```

### Remove Accounts To Whitelist - [perm_removeAccountsFromWhitelist](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#perm_removeAccountsfromwhitelist)
```js
const result = await provider.removeAccountsFromWhitelist(["0xb9b81ee349c3807e46bc71aa2632203c5b462032", "0xb9b81ee349c3807e46bc71aa2632203c5b462034"])
console.log(result) // Success
```

### Add Nodes To Whitelist - [perm_addNodesToWhitelist](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#perm_addnodestowhitelist)
```js
const result = await provider.addNodesToWhitelist(["enode://7e4ef30e9ec683f26ad76ffca5b5148fa7a6575f4cfad4eb0f52f9c3d8335f4a9b6f9e66fcc73ef95ed7a2a52784d4f372e7750ac8ae0b544309a5b391a23dd7@127.0.0.1:30303","enode://2feb33b3c6c4a8f77d84a5ce44954e83e5f163e7a65f7f7a7fec499ceb0ddd76a46ef635408c513d64c076470eac86b7f2c8ae4fcd112cb28ce82c0d64ec2c94@127.0.0.1:30304"])
console.log(result) // Success
```

### Get Nodes on Whitelist - [perm_getNodesWhitelist](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#perm_getnodeswhitelist)
```js
const nodes = await provider.getNodesWhitelist()
console.log(nodes) 
/* [
  "enode://7b61d5ee4b44335873e6912cb5dd3e3877c860ba21417c9b9ef1f7e500a82213737d4b269046d0669fb2299a234ca03443f25fe5f706b693b3669e5c92478ade@127.0.0.1:30305",
  "enode://2feb33b3c6c4a8f77d84a5ce44954e83e5f163e7a65f7f7a7fec499ceb0ddd76a46ef635408c513d64c076470eac86b7f2c8ae4fcd112cb28ce82c0d64ec2c94@127.0.0.1:30304"
] */
```

### Remove Nodes To Whitelist - [perm_removeNodesFromWhitelist](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#perm_removenodesfromwhitelist)
```js
const result = await provider.removeNodesFromWhitelist(["enode://7e4ef30e9ec683f26ad76ffca5b5148fa7a6575f4cfad4eb0f52f9c3d8335f4a9b6f9e66fcc73ef95ed7a2a52784d4f372e7750ac8ae0b544309a5b391a23dd7@127.0.0.1:30303","enode://2feb33b3c6c4a8f77d84a5ce44954e83e5f163e7a65f7f7a7fec499ceb0ddd76a46ef635408c513d64c076470eac86b7f2c8ae4fcd112cb28ce82c0d64ec2c94@127.0.0.1:30304"])
console.log(result) // Success
```

### Reload Permissions From File - [perm_reloadPermissionsFromFile](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#perm_reloadpermissionsfromfile)
```js
const result = await provider.reloadPermissionsFromFile()
console.log(result) // Success
```

## Txpool

The txpool methods require the `TXPOOL` API methods to be enabled by Pantheon's [--rpc-http-api](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-CLI-Syntax/) command line option.

### Pantheon Statistics - [txpool_pantheonstatistics](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#txpool_pantheonstatistics)
```js
const stats = await provider.pantheonStatistics()
console.log(stats)  // {"maxSize": 4096, "localCount": 1, "remoteCount": 0}
```

### Pantheon Transactions - [txpool_pantheontransactions](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#txpool_pantheontransactions)
```js
const results = await provider.pantheonStatistics()
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

# Pantheon

[Pantheon](https://docs.pantheon.pegasys.tech/en/latest/#what-is-pantheon) is an open-source Ethereum client written in Java. It runs on the Ethereum public network, private networks, and test networks such as Rinkeby, Ropsten, and Görli. Pantheon implements Proof of Work (Ethash) and Proof of Authority (IBFT 2.0 and Clique) consensus mechanisms.

This library will only work against [Pantheon 1.2.0](https://github.com/PegaSysEng/pantheon/releases/tag/1.2.0) and above. It will not work against the 1.1.x releases. 
The library uses Pantheon's [JSON-RPC APIs](https://docs.pantheon.pegasys.tech/en/latest/Pantheon-API/JSON-RPC-API/) over HTTP.

See [Pantheon Privacy](https://docs.pantheon.pegasys.tech/en/latest/Privacy/Privacy-Overview/) for more details on how Pantheon supports private transactions.

[Private Network with Privacy Enabled Quickstart Tutorial](https://docs.pantheon.pegasys.tech/en/latest/Privacy/Privacy-Quickstart/) steps through setting up a three node private network managed by Docker Compose. The TL;DR version is
```bash
git clone https://github.com/PegaSysEng/pantheon-quickstart.git
cd pantheon-quickstart/privacy
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

To bash into the to the Pantheon image used by the quickstart
```bash
docker run -it --entrypoint=sh quickstart/pantheon:develop-privacy
```

To bash into a running docker-compose service. eg node1
```bash
docker-compose exec node1 sh
```

To pull the latest Pantheon and Orion docker images from the `develop` branch and build a `quickstart/pantheon:develop-privacy` image
```bash
cd privacy
docker image pull pegasyseng/pantheon:develop
docker-compose build bootnode
docker-compose build --pull orion1
```

The Pantheon tags for the Docker images can be found at https://hub.docker.com/r/pegasyseng/pantheon/tags

There are three pre-funded accounts if you run Pantheon in dev mode. See the `alloc` section in https://github.com/PegaSysEng/pantheon/blob/master/config/src/main/resources/dev.json

## Web3.js

Pantheon has an [EEA JavaScript library](https://github.com/PegaSysEng/web3js-eea#eea-javascript-libraries---eeajs) that is an extension of the [Web3.js](https://web3js.readthedocs.io/en/1.0/) JavaScript library. The EEA JavaScript library is an alternative to this Ethers.js extended library. It can also be used as a reference to how Pantheon privacy transactions are encoded.
The EEA Web3js library does not include the Pantheon extended APIs like admin, clique, ibft, txpool, perm and priv.


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

One way to test a new package before publishing it is to run `npm pack` and then update the examples to point to the created package file. eg `pantheon-ethers-0.0.1.tgz`. In [examples/package.json](./examples/package.json), change the `pantheon-ethers` dependency to point to the created package file. eg `"pantheon-ethers": "../pantheon-ethers-0.0.1.tgz"`.
You can then run an example.
```bash
npm pack
cd examples
node privateTransactions.js
```
