#!/system/bin/sh
# SPDX-License-Identifier: MIT
set -eu
mkdir "$OLEA_APP_BASE/rootfs/run/m4-update-protocol-a01.started"
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
cd /workspace/m4-update-a01
exec node /workspace/m4-update-a01/update-protocol.mjs
'
