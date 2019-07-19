#!/bin/bash

rm -rf ../testchain/pantheon
mkdir -p ../testchain/pantheon/data

# get the latest Pantheon Docker image
docker image pull pegasyseng/pantheon

cp ./key ../testchain/pantheon/data

parentDir="$(dirname "$(pwd)")"

# Export public key for Pantheon node
docker run --mount type=bind,source=$parentDir/testchain/pantheon/data,target=/var/lib/pantheon pegasyseng/pantheon:latest public-key export-address
