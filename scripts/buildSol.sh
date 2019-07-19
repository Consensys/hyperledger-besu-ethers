#!/bin/bash

rm -f ../src/abis/*

## get the grand parent directory of this scripts directory
#parentDir="$(dirname "$(pwd)")"
#grandParentDir="$(dirname $parentDir)"
#openZepplinPath=$grandParentDir"/node_modules/openzeppelin-solidity"
#
#echo "Path to Open Zepplin source code $openZepplinPath"

if [[ -z "${SOLC}" ]]; then
    solcBinary="solc"
else
    solcBinary="${SOLC}"
fi

$solcBinary -o ../src/abis ../src/contracts/*.sol --overwrite --optimize --bin --abi # --bin-runtime
#$solcBinary -o ../srv/abis ../src/contracts/*.sol --allow-paths $parentDir/node_modules/openzeppelin-solidity --overwrite --optimize --bin --abi --bin-runtime

# Add the .json extension to the ani file so TypeScript will parse it
#find ../src/abis -name *.abi  -exec mv {} {}.json  \;
