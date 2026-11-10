#!/system/bin/sh
set -eu
/system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
export DEBIAN_FRONTEND=noninteractive
timeout --kill-after=5s 225s apt-get --no-download install -y --no-install-recommends git ca-certificates curl
dpkg --audit
test -s /etc/ssl/certs/ca-certificates.crt
git --version
printf "FRESH_INSTALL_OK\n"
'
