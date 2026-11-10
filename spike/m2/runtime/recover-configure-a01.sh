#!/system/bin/sh
set -eu
/system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
export DEBIAN_FRONTEND=noninteractive
timeout --kill-after=5s 210s dpkg --configure -a
dpkg --audit
git --version
test -s /etc/ssl/certs/ca-certificates.crt
printf "RECOVER_CONFIGURE_OK\n"
'
