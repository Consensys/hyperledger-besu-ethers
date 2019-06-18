# Ethers.js for Enterprise Ethereum Alliance Clients

An extension of Richard Moore's excellent [Ethers.js](https://docs.ethers.io/ethers.js/html/) Ethereum library that supports [private transactions](https://entethalliance.github.io/client-spec/spec.html#sec-private-transactions) in accordance to [Enterprise Ethereum Alliance's](https://entethalliance.org/) [Ethereum Client Specification](https://entethalliance.github.io/client-spec/spec.html). Specifically, it adds the `privateFor`, `privateFrom` and `restriction` transaction properties to the [sendTransaction](https://entethalliance.github.io/client-spec/spec.html#sec-eea-sendTransaction) and [sendRawTransaction](https://entethalliance.github.io/client-spec/spec.html#sec-eea-sendRawTransaction) JSON-RPC API calls.

Private transactions are supported by PegaSys's [Pantheon](https://docs.pantheon.pegasys.tech/en/stable/) Ethereum client and J.P.Morgan's [Quorum](https://github.com/jpmorganchase/quorum) distributed ledger. Unfortunately, Quorum's JSON-RPC interface for private transactions is different to the EEA specification, so this library only works with Pantheon and not Quorum.

## Install

## Usage

## Pantheon

See [Pantheon Privacy](https://docs.pantheon.pegasys.tech/en/latest/Privacy/Privacy-Overview/) for more details on how Pantheon supports private transactions.

[Private Network with Privacy Enabled Quickstart Tutorial](https://docs.pantheon.pegasys.tech/en/latest/Privacy/Privacy-Quickstart/) steps through setting up a three node private network managed by Docker Compose. The TL;DR version is
```bash

git clone https://github.com/PegaSysEng/pantheon-quickstart.git
cd pantheon-quickstart/privacy
./run.sh
cd ..
git clone https://github.com/PegaSysEng/eeajs.git
cd eeajs
npm i

```

You can see the logs from the nodes running on docker-compose with
```bash
docker-compose logs -f
```

A blockchain explorer will be at http://localhost:32768


### Web3.js
Pantheon has an [EEA JavaScript library](https://github.com/PegaSysEng/web3js-eea#eea-javascript-libraries---eeajs) that is an extension of the [Web3.js](https://web3js.readthedocs.io/en/1.0/) JavaScript library. The EEA JavaScript library is an alternative to this Ethers.js extended library. It can also be used as a reference to how Pantheon privacy transactions are encoded.

## Ethers.js version

Currently, Ethers.js version 5 is used as it is more module making it easier to extend the transaction serialization and parsing. See Richard's blog on [Beta Release: ethers.js v5](https://blog.ricmoo.com/beta-release-ethers-js-v5-59d0db222d7b) for more details.

Ethers version 5
* [Documentation](https://docs.ethers.io/ethers.js/v5-beta/)
* [Code on branch ethers-v5-beta](https://github.com/ethers-io/ethers.js/tree/ethers-v5-beta)

