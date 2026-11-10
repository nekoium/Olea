#!/system/bin/sh
set -eu
printf 'APP_SHELL_PID=%s\n' "$$"
cat /proc/$$/stat
# Staged public Ubuntu archive only; no provider config is copied into this payload.
cp /data/local/tmp/olea-m2-ubuntu.tar.gz "$OLEA_APP_BASE/rootfs/run/bootstrap-base.tar.gz"
/system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
/bin/tar -xzf /run/bootstrap-base.tar.gz -C / --no-same-owner --exclude=dev --exclude=proc --exclude=sys
printf "nameserver 10.0.2.3\n" > /etc/resolv.conf
export DEBIAN_FRONTEND=noninteractive
apt-get -o Acquire::Retries=0 -o Acquire::http::Timeout=25 -o Acquire::https::Timeout=25 update
apt-get -o Acquire::Retries=0 -o Acquire::http::Timeout=25 -o Acquire::https::Timeout=25 install -y --no-install-recommends git ca-certificates curl
node --version
npm --version
git --version
printf "PREPARE_OK\n"
'
