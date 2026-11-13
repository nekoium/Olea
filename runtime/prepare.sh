#!/bin/sh
# SPDX-License-Identifier: MIT
set -eu
export DEBIAN_FRONTEND=noninteractive
printf 'Preparing Linux certificates and workspace tools\n'
timeout --kill-after=5s 300s apt-get -o Acquire::Retries=0 -o Acquire::http::Timeout=45 update
timeout --kill-after=5s 300s apt-get -o Acquire::Retries=0 -o Acquire::http::Timeout=45 install -y --no-install-recommends ca-certificates git python3
# Agent choice belongs to onboarding; preparing Linux never chooses or reinstalls an agent.
python3 -c 'import pty, termios; print("Terminal support ready")'
printf 'Environment ready\n'
