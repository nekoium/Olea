#!/usr/bin/env bash
# Original source MIT. Host provisioner; ADB only provisions/observes.
set -euo pipefail
: "${OLEA_ADB:=/c/Users/Aria/AppData/Local/Android/Sdk/platform-tools/adb.exe}"
: "${OLEA_SERIAL:=emulator-5554}"
: "${OLEA_STAGE:=.setup}"
export MSYS_NO_PATHCONV=1
adb() { "$OLEA_ADB" -s "$OLEA_SERIAL" "$@"; }
run() { adb shell run-as dev.olea.spike sh -c "'$*'"; }
[[ -f "$OLEA_STAGE/ubuntu-base.tar.gz" && -f "$OLEA_STAGE/node.tar.xz" ]]
echo '6bc2cde3930ad088b3bb46fa45279e96d25bc3810f209850ecbe4722711874f9  .setup/ubuntu-base.tar.gz' | sha256sum -c -
mkdir -p "$OLEA_STAGE/debs/proot" "$OLEA_STAGE/debs/libtalloc" "$OLEA_STAGE/debs/shmem"
node spike/runtime/extract-deb.mjs "$OLEA_STAGE/proot.deb" 2497064226c15971be8131c7facead94a06c225347796326a383c832dca57758 "$OLEA_STAGE/debs/proot"
node spike/runtime/extract-deb.mjs "$OLEA_STAGE/libtalloc.deb" b8c6d95f20075dc1f9ec6573575b2444e8d526e48e0d8d6d5cf4e071e6e06530 "$OLEA_STAGE/debs/libtalloc"
node spike/runtime/extract-deb.mjs "$OLEA_STAGE/libandroid-shmem.deb" ffa9e4c87467b158b148d0ff92dda796aa038276c2075af3269cdcdb06f25797 "$OLEA_STAGE/debs/shmem"
adb push "$OLEA_STAGE/ubuntu-base.tar.gz" /data/local/tmp/olea-ubuntu.tar.gz
adb push "$OLEA_STAGE/node.tar.xz" /data/local/tmp/olea-node.tar.xz
run 'mkdir -p files/rootfs files/tmp; test ! -e files/rootfs/.olea-provisioned'
run 'cd files/rootfs && tar -xzf /data/local/tmp/olea-ubuntu.tar.gz --no-same-owner 2>../ubuntu-extract.log'
for package in proot libtalloc shmem; do
  archive=$(rg --files "$OLEA_STAGE/debs/$package" -g 'data.tar.*')
  adb push "$archive" "/data/local/tmp/olea-$package.tar.xz"
  run "cd files && tar -xf /data/local/tmp/olea-$package.tar.xz --strip-components=5"
done
run 'mkdir -p files/rootfs/opt/node files/rootfs/workspace files/rootfs/run; cd files/rootfs/opt/node && tar -xJf /data/local/tmp/olea-node.tar.xz --strip-components=1'
adb push spike/runtime/linux.sh /data/local/tmp/olea-linux.sh
run 'cp /data/local/tmp/olea-linux.sh files/linux.sh; chmod 700 files/linux.sh; chmod -R u+rx files/usr; touch files/rootfs/.olea-provisioned'
run 'printf "nameserver 1.1.1.1\nnameserver 8.8.8.8\n" > files/rootfs/etc/resolv.conf'
echo 'Provisioned app-private rootfs; run-as dev.olea.spike files/linux.sh /bin/sh -lc <command>.'
