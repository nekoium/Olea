#!/system/bin/sh
# SPDX-License-Identifier: MIT
set -eu
BASE=${OLEA_APP_BASE:?}
NATIVE=${OLEA_NATIVE_DIR:?}
export LD_PRELOAD="$NATIVE/libtalloc.so:$NATIVE/libandroid-shmem.so"
export LD_LIBRARY_PATH="$NATIVE"
export PROOT_LOADER="$NATIVE/libloader.so"
export PROOT_LOADER_32="$NATIVE/libloader32.so"
export PROOT_TMP_DIR="$BASE/tmp"
mkdir -p "$PROOT_TMP_DIR" "$BASE/phone" "$BASE/data/home/.olea"
if [ -f "$BASE/data/home/.olea/provider.json" ]; then
  set -- OLEA_PROVIDER_CONFIG=/root/.olea/provider.json "$@"
fi
if [ -f "$BASE/phone/config.json" ]; then
  set -- OLEA_BRIDGE_CONFIG=/olea-phone/config.json "$@"
fi
set -- /system/bin/env -i HOME=/root USER=root TERM=xterm-256color \
  PATH=/opt/node/bin:/opt/agents/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  LANG=C.UTF-8 OLEA_PI_ENTRY=/opt/agents/lib/node_modules/@earendil-works/pi-coding-agent/dist/cli.js \
  OLEA_WORKSPACE=/workspace OLEA_WORKSPACE_ROOT=/workspace OLEA_STATE_DIR=/sessions \
  OLEA_CODEX_ENTRY=/opt/agents/lib/node_modules/@openai/codex/bin/codex.js OLEA_CODEX_ACCESS_MODE=full-access "$@"
# Android validates each source and leaves a file at every connected guest path.
# If a source disappears or PRoot skips a bind, backend directory validation cannot use that file as cwd.
if [ -n "${OLEA_WORKSPACE_BINDS:-}" ]; then
  while IFS="$(printf '\t')" read -r source guest; do
    [ -n "$source$guest" ] || continue
    case "$guest" in /workspace/workspace-*) id=${guest#/workspace/workspace-} ;; *) echo 'Invalid workspace binding' >&2; exit 2;; esac
    case "$id" in ''|*[!a-zA-Z0-9_-]*) echo 'Invalid workspace binding ID' >&2; exit 2;; esac
    [ "${#id}" -le 64 ] || { echo 'Invalid workspace binding ID' >&2; exit 2; }
    case "$source" in /*) ;; *) echo 'Invalid workspace source' >&2; exit 2;; esac
    case "$source" in *:*|*\\*|*/../*|*/./*|*/..|*/.) echo 'Invalid workspace source' >&2; exit 2;; esac
    placeholder="$BASE/data/workspace/workspace-$id"
    [ -f "$placeholder" ] && [ ! -L "$placeholder" ] || { echo 'Connected workspace fallback is not blocked.' >&2; exit 2; }
    if [ ! -d "$source" ] || [ ! -r "$source" ] || [ ! -w "$source" ]; then
      echo 'Skipping unavailable connected folder; restore Android access and restart before using it.' >&2
      continue
    fi
    set -- -b "$source:$guest" "$@"
  done < "$OLEA_WORKSPACE_BINDS"
fi
exec "$NATIVE/libproot.so" --link2symlink -0 -r "$BASE/runtime/rootfs" -b /dev -b /proc -b /sys \
  -b /system -b /apex -b "$NATIVE" \
  -b "$BASE/data/workspace:/workspace" -b "$BASE/data/home:/root" \
  -b "$BASE/data/sessions:/sessions" -b "$BASE/backend:/olea" -b "$BASE/phone:/olea-phone" \
  -w /workspace "$@"
