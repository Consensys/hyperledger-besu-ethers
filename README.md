# Ethers.js for Enterprise Ethereum Alliance Clients

An extension of Richard Moore's excellent [Ethers.js](https://docs.ethers.io/ethers.js/html/) Ethereum library that supports [private transactions](https://entethalliance.github.io/client-spec/spec.html#sec-private-transactions) in accordance to [Enterprise Ethereum Alliance's](https://entethalliance.org/) [Ethereum Client Specification](https://entethalliance.github.io/client-spec/spec.html). Specifically, it adds the `privateFor`, `privateFrom` and `restriction` transaction properties to the [sendTransaction](https://entethalliance.github.io/client-spec/spec.html#sec-eea-sendTransaction) and [sendRawTransaction](https://entethalliance.github.io/client-spec/spec.html#sec-eea-sendRawTransaction) JSON-RPC API calls.

Private transactions are supported by PegaSys's [Pantheon](https://docs.pantheon.pegasys.tech/en/stable/) Ethereum client and J.P.Morgan's [Quorum](https://github.com/jpmorganchase/quorum) distributed ledger. Unfortunately, Quorum's JSON-RPC interface for private transactions is different to the EEA specification, so this library only works with Pantheon and not Quorum.

## Install

To install as a node module
```bash
npm install eea-ethers
```

## Usage

See [Ethers.js version 5](https://docs.ethers.io/ethers.js/v5-beta/) documentation for details on how the Ethers.js library works.

## Pantheon

This library will only work against Pantheon 1.2 and above. It will not work against the 1.1.x releases.

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

