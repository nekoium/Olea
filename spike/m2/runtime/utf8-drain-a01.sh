#!/system/bin/sh
set -eu
/system/bin/sh "$OLEA_APP_BASE/linux.sh" /opt/node/bin/node -e 'process.stdout.write("界".repeat(30000));process.stderr.write("🙂".repeat(20000))'
