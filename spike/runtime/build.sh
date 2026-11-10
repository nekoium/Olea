#!/usr/bin/env bash
# Original source MIT. Tool archives remain in ignored project-local .setup.
set -euo pipefail
: "${JAVA_HOME:=/c/Program Files/Android/Android Studio/jbr}"
export JAVA_HOME
: "${GRADLE_USER_HOME:=$(pwd)/.setup/gradle-home}"
export GRADLE_USER_HOME
if [[ ! -f .setup/gradle-9.1.0/bin/gradle ]]; then
  echo 'a17ddd85a26b6a7f5ddb71ff8b05fc5104c0202c6e64782429790c933686c806  .setup/gradle-proxy.zip' | sha256sum -c -
  unzip -q .setup/gradle-proxy.zip -d .setup
fi
.setup/gradle-9.1.0/bin/gradle --no-daemon -p spike/android "$@"
