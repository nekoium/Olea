#!/usr/bin/env bash
# Original MIT. Run one staged attempt in the actual Kotlin service, never through run-as exec.
set -euo pipefail
export MSYS_NO_PATHCONV=1
: "${OLEA_ADB:=C:/Users/Aria/AppData/Local/Android/Sdk/platform-tools/adb.exe}"
: "${OLEA_SERIAL:=emulator-5554}"
attempt=${1:?attempt ID required}
[[ $attempt =~ ^[a-z0-9-]{1,64}$ ]]
script=${2:?script required}
adb() { "$OLEA_ADB" -s "$OLEA_SERIAL" "$@"; }
adb push "$script" "/data/local/tmp/olea-m2-$attempt.sh"
adb shell run-as dev.olea.m2.runtime sh -c "'mkdir -p files/m2; test ! -e files/m2/$attempt.json; cp /data/local/tmp/olea-m2-$attempt.sh files/m2/$attempt.sh'"
adb shell am start -f 0x18000000 -n dev.olea.m2.runtime/dev.olea.spike.MainActivity --es m2Probe "$attempt"
echo "Started $attempt; collect after bounded case completes."
