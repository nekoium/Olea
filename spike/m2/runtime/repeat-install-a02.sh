#!/system/bin/sh
set -eu
/system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
printf "%s  %s\n" f9fbacd417b515450b831032cc39d18059e9874e67525679a43c16071dabf9a0 /var/cache/apt/archives/ca-certificates_20260816ubuntu0.24.04.2_all.deb | sha256sum -c -
export DEBIAN_FRONTEND=noninteractive
timeout --kill-after=5s 225s apt-get --no-download install -y --no-install-recommends git ca-certificates curl
dpkg --audit
test -s /etc/ssl/certs/ca-certificates.crt
git --version
printf "FRESH_INSTALL_VERIFIED_CACHE_OK\n"
'
