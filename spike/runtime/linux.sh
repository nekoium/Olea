#!/system/bin/sh
# Original source MIT. Run as the Olea app UID; never run this as root.
set -eu
BASE=/data/user/0/dev.olea.spike/files
export LD_LIBRARY_PATH="$BASE/usr/lib"
export PROOT_TMP_DIR="$BASE/tmp"
export PROOT_LOADER="$BASE/usr/libexec/proot/loader"
export PROOT_LOADER_32="$BASE/usr/libexec/proot/loader32"
mkdir -p "$BASE/tmp"
# Rootfs is an app-owned compatibility environment, not a security boundary.
exec "$BASE/usr/bin/proot" --link2symlink -0 -r "$BASE/rootfs" \
  -b /dev -b /proc -b /sys -b "$BASE/bridge-config.json:/run/olea-bridge.json" \
  -b "$BASE/bridge-token:/run/olea-token" \
  -w /workspace /usr/bin/env -i HOME=/root USER=root TERM=xterm-256color \
  PATH=/opt/node/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  LANG=C.UTF-8 OLEA_BRIDGE_CONFIG=/run/olea-bridge.json \
  OLEA_BRIDGE_TOKEN_FILE=/run/olea-token "$@"
