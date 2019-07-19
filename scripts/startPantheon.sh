#!/bin/bash

parentDir="$(dirname "$(pwd)")"

docker run -p 20000:8545 --mount type=bind,source=$parentDir/testchain/pantheon/data,target=/var/lib/pantheon --mount type=bind,source=$(pwd)/cliqueGenesis.json,target=/etc/pantheon/genesis.json pegasyseng/pantheon:latest --bootnodes --rpc-http-enabled --rpc-http-api=ETH,NET,CLIQUE --host-whitelist=* --rpc-http-cors-origins="all" --logging=DEBUG
