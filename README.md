# Ethers.js for Pantheon

An extension of Richard Moore's excellent [Ethers.js](https://docs.ethers.io/ethers.js/html/) Ethereum library that adds [Pantheon](https://docs.pantheon.pegasys.tech/en/stable/#what-is-pantheon)'s extended APIs. This includes support for [private transactions](https://entethalliance.github.io/client-spec/spec.html#sec-private-transactions) in accordance to [Enterprise Ethereum Alliance's](https://entethalliance.org/) [Ethereum Client Specification](https://entethalliance.github.io/client-spec/spec.html). Specifically, it adds the `privateFor`, `privateFrom` and `restriction` transaction properties to the [sendTransaction](https://entethalliance.github.io/client-spec/spec.html#sec-eea-sendTransaction) and [sendRawTransaction](https://entethalliance.github.io/client-spec/spec.html#sec-eea-sendRawTransaction) JSON-RPC API calls.

Private transactions are supported by PegaSys's [Pantheon](https://docs.pantheon.pegasys.tech/en/stable/) Ethereum client and J.P.Morgan's [Quorum](https://github.com/jpmorganchase/quorum) distributed ledger. Unfortunately, Quorum's JSON-RPC interface for private transactions is different to the EEA specification, so this library only works with Pantheon and not Quorum.

The library also adds support for Pantheon's [admin](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#admin-methods), [txpool](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#txpool-methods) and [miscellaneous](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#miscellaneous-methods) JSON-RPC APIs.

## Install

To install as a node module
```bash
npm install pantheon-ethers
```

## Usage

See [Ethers.js version 5](https://docs.ethers.io/ethers.js/v5-beta/) documentation for details on how the Ethers.js library works.

### Privacy Group Management

Create, find and delete a [privacy group](https://docs.pantheon.pegasys.tech/en/stable/Privacy/Explanation/Privacy-Groups/).

Full code examples using promises [examples/privacyGroupManagementPromises.js](./examples/privacyGroupManagementPromises.js) or async/await [example/privacyGroupManagementAsync.js](./examples/privacyGroupManagementAsync.js) work against the [Privacy Enabled Quickstart Tutorial](https://docs.pantheon.pegasys.tech/en/stable/Tutorials/Privacy-Quickstart/).

#### Create a new privacy group - [priv_createPrivacyGroup](https://docs.pantheon.pegasys.tech/en/stable/Reference/Pantheon-API-Methods/#priv_createprivacygroup)
```js
  const privacyGroupId = providerNode1.createPrivacyGroup(
    [node1, node2],
    'Name of group',
    'Description of top secret group')
  console.log(privacyGroupId) // GcFhoLY7EMQg7jxJDC6Aei1GZTN/ZaRepptX48VcUBk=
```

#### Find privacy groups - [priv_findPrivacyGroup](https://docs.pantheon.pegasys.tech/en/stable/Reference/Pantheon-API-Methods/#priv_findprivacygroup)
```js
  const results = providerNode1.findPrivacyGroup([node1, node2])
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

#### Delete privacy group - [priv_deletePrivacyGroup](https://docs.pantheon.pegasys.tech/en/stable/Reference/Pantheon-API-Methods/#priv_deleteprivacygroup)
```js
  const deletedId = providerNode1.deletePrivacyGroup(privacyGroupId)
  console.log(deletedId) // GcFhoLY7EMQg7jxJDC6Aei1GZTN/ZaRepptX48VcUBk=
```

### Pantheon Administration

Calls Pantheon's [administration methods](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#admin-methods) JSON-RPC APIs. See [examples/pantheonAdmin.js](./examples/pantheonAdmin.js) for the full example code async/await.

The admin methods require the `ADMIN` API methods to be enabled by Pantheon's [--rpc-http-api](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-CLI-Syntax/) command line option.

#### Get module versions - [rpc_modules](https://docs.pantheon.pegasys.tech/en/stable/Reference/Pantheon-API-Methods/#rpc_modules)
```ts
const moduleVersions = await provider.getModuleVersions()
console.log(moduleVersions) // {eea: '1.0', web3: '1.0', eth: '1.0', admin: '1.0', priv: '1.0', net: '1.0'}
```

#### Change log level - [admin_changeLogLevel](https://docs.pantheon.pegasys.tech/en/stable/Reference/Pantheon-API-Methods/#admin_changeloglevel)

See [logging](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-CLI-Syntax/#logging) for the allowed log levels.
```ts
await provider.changeLogLevel('TRACE')
```

#### Get node information - [admin_nodeInfo](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#admin_nodeinfo)
```ts
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

#### Get peers - [admin_peers](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#admin_peers)
```ts
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
    id: '0x0cd6125df42a7d90b0e4a509c9ef54d7791b71b9f08b5e9e9d4d52ff8441bfcdeda61cd1f975db9fdd71f43248baa7d204d316ff36794f072fd66505b272261a' },
  { version: '0x5',
    name: 'pantheon/v1.2.1-dev-09c1da96/linux-x86_64/oracle_openjdk-java-11',
    caps: [ 'eth/62', 'eth/63' ],
    network:
     { localAddress: '172.20.0.10:40352',
       remoteAddress: '172.20.0.9:30303' },
    port: '0x765f',
    id: '0xaf80b90d25145da28c583359beb47b21796b2fe1a23c1511e443e7a64dfdb27d7434c380f0aa4c500e220aa1a9d068514b1ff4d5019e624e7ba1efe82b340a59' },
  { version: '0x5',
    name: 'pantheon/v1.2.1-dev-09c1da96/linux-x86_64/oracle_openjdk-java-11',
    caps: [ 'eth/62', 'eth/63' ],
    network:
     { localAddress: '172.20.0.10:50894',
       remoteAddress: '172.20.0.6:30303' },
    port: '0x765f',
    id: '0x0cdc1cd03bee518d60b94f50fe53ba1722c9693011d1a39cbbda06e091d3993746f29b17c957104ad26246da757a7bed3cf7c59a41dccbf2234c86c68439827b' },
  { version: '0x5',
    name: 'pantheon/v1.2.1-dev-09c1da96/linux-x86_64/oracle_openjdk-java-11',
    caps: [ 'eth/62', 'eth/63' ],
    network:
     { localAddress: '172.20.0.10:59336',
       remoteAddress: '172.20.0.7:30303' },
    port: '0x765f',
    id: '0xce7edc292d7b747fab2f23584bbafaffde5c8ff17cf689969614441e0527b90015ea9fee96aed6d9c0fc2fbe0bd1883dee223b3200246ff1e21976bdbc9a0fc8' } ]
*/
```

#### Remove peer - [admin_removePeer](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#admin_removePeer)
```ts
const success = removePeer("enode://af80b90d25145da28c583359beb47b21796b2fe1a23c1511e443e7a64dfdb27d7434c380f0aa4c500e220aa1a9d068514b1ff4d5019e624e7ba1efe82b340a59@127.0.0.1:30304")
```

#### Add peer - [admin_addPeer](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#admin_addPeer)
```ts
const success = addPeer("enode://af80b90d25145da28c583359beb47b21796b2fe1a23c1511e443e7a64dfdb27d7434c380f0aa4c500e220aa1a9d068514b1ff4d5019e624e7ba1efe82b340a59@127.0.0.1:30304")
```

### Txpool Methods

The txpool methods require the `TXPOOL` API methods to be enabled by Pantheon's [--rpc-http-api](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-CLI-Syntax/) command line option.

#### Pantheon Statistics - [txpool_pantheonstatistics](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#txpool_pantheonstatistics)
```ts
const stats = pantheonStatistics()
console.log(stats)  // {"maxSize": 4096, "localCount": 1, "remoteCount": 0}
```

#### Pantheon Transactions - [txpool_pantheontransactions](https://docs.pantheon.pegasys.tech/en/latest/Reference/Pantheon-API-Methods/#txpool_pantheontransactions)
```ts
const results = pantheonStatistics()
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

## Pantheon

This library will only work against Pantheon 1.2 and above. It will not work against the 1.1.x releases. The library uses Pantheon's [JSON-RPC APIs](https://docs.pantheon.pegasys.tech/en/latest/Pantheon-API/JSON-RPC-API/) over HTTP.

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
./stop.sh   # shuts down all of the docker sercices
./remove.sh # stops and then removes the server volumes so the chain will start back at block 0
```

A blockchain explorer will be at http://localhost:32768

To tail the logs of a specific docker servive. eg node 1
```bash
docker-compose logs -f node1 orion1
```

To bash into the to the Pantheon image used by the quickstart
```bash
docker run -it --entrypoint=sh quickstart/pantheon:develop-privacy
```

To bash into a running docker compose service. eg node1
```bash
docker-compose exec node1 sh
```

To pull the latest Pantheon docker image from the `develop` branch and build a `quickstart/pantheon:develop-privacy` image
```bash
docker image pull pegasyseng/pantheon:develop
docker-compose build bootnode
```

The Pantheon tags for the Docker images can be found at https://hub.docker.com/r/pegasyseng/pantheon/tags

There are three pre-funded accounts if you run Pantheon in dev mode. See the alloc section in https://github.com/PegaSysEng/pantheon/blob/master/config/src/main/resources/dev.json

### Web3.js

Pantheon has an [EEA JavaScript library](https://github.com/PegaSysEng/web3js-eea#eea-javascript-libraries---eeajs) that is an extension of the [Web3.js](https://web3js.readthedocs.io/en/1.0/) JavaScript library. The EEA JavaScript library is an alternative to this Ethers.js extended library. It can also be used as a reference to how Pantheon privacy transactions are encoded.

## Ethers.js version

Currently, Ethers.js version 5 is used as it is more module making it easier to extend the transaction serialization and parsing. See Richard's blog on [Beta Release: ethers.js v5](https://blog.ricmoo.com/beta-release-ethers-js-v5-59d0db222d7b) for more details.

For regression testing purposes, ethers version 4 is also installed in the devDependencies. This uses a npm alias which is available from npm version 6.9.0. See (this)[https://stackoverflow.com/a/56495895/3144809] Stack Overflow answer for more information.
```bash
npm i ethers-4@npm:ethers@4.0.33
```

Ethers version 5
* [Documentation](https://docs.ethers.io/ethers.js/v5-beta/)
* [Code on branch ethers-v5-beta](https://github.com/ethers-io/ethers.js/tree/ethers-v5-beta)

