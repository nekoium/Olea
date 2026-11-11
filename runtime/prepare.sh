#!/bin/sh
# SPDX-License-Identifier: MIT
set -eu
export DEBIAN_FRONTEND=noninteractive
printf 'Preparing Linux certificates and workspace tools\n'
timeout --kill-after=5s 300s apt-get -o Acquire::Retries=0 -o Acquire::http::Timeout=45 update
timeout --kill-after=5s 300s apt-get -o Acquire::Retries=0 -o Acquire::http::Timeout=45 install -y --no-install-recommends ca-certificates git
printf 'Installing stock Pi through npm\n'
timeout --kill-after=5s 300s npm install --global --prefix /opt/agents --fetch-retries=0 --fetch-timeout=45000 --maxsockets=2 --no-audit --no-fund @earendil-works/pi-coding-agent@1.5.2
node /opt/agents/lib/node_modules/@earendil-works/pi-coding-agent/dist/cli.js --version
printf 'Environment ready\n'
