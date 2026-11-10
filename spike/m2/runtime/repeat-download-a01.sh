#!/system/bin/sh
set -eu
/system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
export DEBIAN_FRONTEND=noninteractive
timeout --kill-after=5s 225s apt-get -o Acquire::Retries=0 -o Acquire::http::Timeout=25 -o Acquire::https::Timeout=25 install --download-only -y --no-install-recommends git ca-certificates curl
printf "FRESH_DOWNLOAD_OK\n"
'
