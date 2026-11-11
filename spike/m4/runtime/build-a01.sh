#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Reuse prepared compiler/dependency cache; all source/output belongs to this child.
set -eu
export JAVA_HOME='/c/Program Files/Android/Android Studio/jbr'
export ANDROID_HOME='C:/Users/Aria/AppData/Local/Android/Sdk'
export GRADLE_USER_HOME='C:/Users/Aria/orca/workspaces/Olea/m3-native-phone/.setup/gradle-home'
set +e
timeout 240 C:/Users/Aria/orca/workspaces/Olea/m3-native-phone/.setup/gradle-9.1.0/bin/gradle --offline --no-daemon -p spike/android :app:assembleModernDebug --max-workers=2 > .setup/build-m4-a01.log 2>&1
build_status=$?
printf '{"exitCode":%s}\n' "$build_status" > .setup/build-m4-a01-exit.json
exit "$build_status"
