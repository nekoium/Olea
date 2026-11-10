#!/system/bin/sh
set -eu
cp /data/local/tmp/olea-m2-ubuntu.tar.gz "$OLEA_APP_BASE/rootfs/run/bootstrap-base.tar.gz"
/system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
tar -xzf /run/bootstrap-base.tar.gz -C / --no-same-owner --exclude=dev --exclude=proc --exclude=sys
printf "nameserver 10.0.2.3\n" > /etc/resolv.conf
timeout --kill-after=5s 210s apt-get -o Acquire::Retries=0 -o Acquire::http::Timeout=25 -o Acquire::https::Timeout=25 update
printf "FRESH_BOOTSTRAP_OK\n"
'
