#!/usr/bin/env bash
# Original MIT. Development provisioning only; execution evidence must come from RuntimeService.
set -euo pipefail
export MSYS_NO_PATHCONV=1
: "${OLEA_ADB:=C:/Users/Aria/AppData/Local/Android/Sdk/platform-tools/adb.exe}"
: "${OLEA_SERIAL:=emulator-5554}"
: "${OLEA_PACKAGE:=dev.olea.m2.runtime}"
[[ $OLEA_PACKAGE =~ ^dev\.olea\.m2\.[a-z0-9.]+$ ]]
adb() { "$OLEA_ADB" -s "$OLEA_SERIAL" "$@"; }
run() { adb shell run-as "$OLEA_PACKAGE" sh -c "'$*'"; }
printf '%s  %s\n' 6bc2cde3930ad088b3bb46fa45279e96d25bc3810f209850ecbe4722711874f9 .setup/downloads/ubuntu-base.tar.gz | sha256sum -c -
printf '%s  %s\n' 2f2c0da162318f0de47665410c7c8c2ed3d36c8f3105de4bbc61176c70a7cbf2 .setup/downloads/node.tar.xz | sha256sum -c -
adb push spike/m2/runtime/claim-rootfs.sh /data/local/tmp/olea-m2-claim-rootfs.sh
run 'sh /data/local/tmp/olea-m2-claim-rootfs.sh files'
xz -dc .setup/downloads/node.tar.xz | gzip -n > .setup/downloads/node.tar.gz
adb push .setup/downloads/ubuntu-base.tar.gz /data/local/tmp/olea-m2-ubuntu.tar.gz
adb push .setup/downloads/node.tar.gz /data/local/tmp/olea-m2-node.tar.gz
# Android cannot create some archive hardlinks. First extract excludes those names;
# the native-domain PRoot case separately tests supported link2symlink re-extraction.
run 'cd files/rootfs; tar -xzf /data/local/tmp/olea-m2-ubuntu.tar.gz --no-same-owner --exclude=usr/bin/perl5.38.2 --exclude=usr/bin/uncompress'
run 'mkdir -p files/rootfs/opt/node files/rootfs/workspace files/rootfs/run; cd files/rootfs/opt/node; tar -xzf /data/local/tmp/olea-m2-node.tar.gz --strip-components=1'
run 'printf "nameserver 10.0.2.3\n" > files/rootfs/etc/resolv.conf'
adb push spike/m2/runtime/linux.sh /data/local/tmp/olea-m2-linux.sh
run 'cp /data/local/tmp/olea-m2-linux.sh files/linux.sh; chmod 700 files/linux.sh; touch files/rootfs/.olea-m2-provisioned'
echo 'Fresh M2 staging complete; no runtime pass is implied.'
