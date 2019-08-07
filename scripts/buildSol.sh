#!/bin/bash

rm -f ../dist/abis/*

if [[ -z "${SOLC}" ]]; then
    solcBinary="solc"
else
    solcBinary="${SOLC}"
fi

$solcBinary -o ../dist/abis ../src/contracts/*.sol --overwrite --optimize --bin --abi --bin-runtime

