#!/usr/bin/env bash
# Original source MIT. Fresh app-owned rootfs only; ADB provisions and observes.
set -euo pipefail
: "${OLEA_ADB:=C:/Users/Aria/AppData/Local/Android/Sdk/platform-tools/adb.exe}"
: "${OLEA_SERIAL:=emulator-5554}"
: "${OLEA_STAGE:=.setup}"
export MSYS_NO_PATHCONV=1
adb() { "$OLEA_ADB" -s "$OLEA_SERIAL" "$@"; }
run() { adb shell run-as dev.olea.spike sh -c "'$*'"; }
BASE=/data/user/0/dev.olea.spike/files
run 'test ! -e files/rootfs/.olea-provisioned'
verify() { echo "$2  $1" | sha256sum -c -; }
verify "$OLEA_STAGE/ubuntu-base.tar.gz" 6bc2cde3930ad088b3bb46fa45279e96d25bc3810f209850ecbe4722711874f9
verify "$OLEA_STAGE/node.tar.xz" 2f2c0da162318f0de47665410c7c8c2ed3d36c8f3105de4bbc61176c70a7cbf2
for item in 'proot:2497064226c15971be8131c7facead94a06c225347796326a383c832dca57758' 'libtalloc:b8c6d95f20075dc1f9ec6573575b2444e8d526e48e0d8d6d5cf4e071e6e06530' 'libandroid-shmem:ffa9e4c87467b158b148d0ff92dda796aa038276c2075af3269cdcdb06f25797'; do
  package=${item%%:*}; hash=${item#*:}
  node spike/runtime/extract-deb.mjs "$OLEA_STAGE/$package.deb" "$hash" "$OLEA_STAGE/debs/$package"
  xz -dc "$OLEA_STAGE/debs/$package/data.tar.xz" | gzip -n > "$OLEA_STAGE/$package-data.tar.gz"
  adb push "$OLEA_STAGE/$package-data.tar.gz" "/data/local/tmp/olea-$package.tar.gz"
  run "mkdir -p files; cd files; tar -xzf /data/local/tmp/olea-$package.tar.gz --strip-components=5"
done
xz -dc "$OLEA_STAGE/node.tar.xz" | gzip -n > "$OLEA_STAGE/node.tar.gz"
adb push "$OLEA_STAGE/ubuntu-base.tar.gz" /data/local/tmp/olea-ubuntu.tar.gz
adb push "$OLEA_STAGE/node.tar.gz" /data/local/tmp/olea-node.tar.gz
run 'mkdir -p files/rootfs files/tmp; cd files/rootfs; tar -xzf /data/local/tmp/olea-ubuntu.tar.gz --no-same-owner --exclude=usr/bin/perl5.38.2 --exclude=usr/bin/uncompress'
# Stock PRoot link2symlink provides Android-compatible hardlink emulation.
run "LD_LIBRARY_PATH=$BASE/usr/lib PROOT_TMP_DIR=$BASE/tmp PROOT_LOADER=$BASE/usr/libexec/proot/loader $BASE/usr/bin/proot --link2symlink -0 -r $BASE/rootfs -b /dev -b /proc -b /data/local/tmp:/bootstrap -w / /usr/bin/env -i PATH=/usr/bin:/bin /bin/tar -xzf /bootstrap/olea-ubuntu.tar.gz -C / --no-same-owner --exclude=dev --exclude=proc"
run 'mkdir -p files/rootfs/opt/node files/rootfs/workspace files/rootfs/run; cd files/rootfs/opt/node; tar -xzf /data/local/tmp/olea-node.tar.gz --strip-components=1'
adb push spike/runtime/linux.sh /data/local/tmp/olea-linux.sh
run 'cp /data/local/tmp/olea-linux.sh files/linux.sh; chmod 700 files/linux.sh; test -e files/rootfs/usr/bin/perl5.38.2; test -e files/rootfs/usr/bin/uncompress; touch files/rootfs/.olea-provisioned'
# Emulator DNS only; physical devices must use their observed resolver.
run 'printf "nameserver 10.0.2.3\n" > files/rootfs/etc/resolv.conf'
echo 'Provisioned verified app-private rootfs. Start host to create protected bridge config before linux.sh.'
