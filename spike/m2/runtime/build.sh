#!/usr/bin/env bash
# Original MIT. One build attempt, bounded; caller explicitly chooses a retry after diagnosis.
set -euo pipefail
: "${JAVA_HOME:=/c/Program Files/Android/Android Studio/jbr}"
export JAVA_HOME
export GRADLE_USER_HOME="$(pwd)/.setup/gradle-home"
printf '%s  %s\n' a17ddd85a26b6a7f5ddb71ff8b05fc5104c0202c6e64782429790c933686c806 .setup/downloads/gradle.zip | sha256sum -c -
if [[ ! -f .setup/gradle-9.1.0/bin/gradle ]]; then unzip -q .setup/downloads/gradle.zip -d .setup; fi
bash spike/m2/runtime/stage-native.sh
# Local proxy arguments, if necessary, are supplied explicitly by this machine's owner.
timeout 240 .setup/gradle-9.1.0/bin/gradle --no-daemon -p spike/android :app:assembleModernDebug --max-workers=2 "$@"
