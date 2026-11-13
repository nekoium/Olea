# Olea 0.1.0 runtime source companion

This archive supplies the runtime sources for `arm64-v8a` and `x86_64` Olea 0.1.0 builds. It contains the source versions selected by `olea/runtime/upstream-inputs.json`, their upstream build recipes and license notices. Olea's MIT license does not replace the licenses of the bundled software.

## Contents

- `ubuntu/`: all 65 exact source-package versions behind the 91 installed packages in each Ubuntu Base 24.04.3 image. Each directory contains the `.dsc`, original source archives and Debian/Ubuntu changes listed by its source index, including packaging/build rules and patches. `olea/runtime/source/ubuntu-packages.json` maps both binary inventories to source versions.
- `indexes/`: exact official Ubuntu `noble`, `noble-updates` and `noble-security` main source indexes from the `20250807T000000Z` snapshot. Each source package's `Checksums-Sha256` stanza establishes the included source-file hashes. Index files themselves are pinned in the source lock.
- `termux/`: exact PRoot 5.1.107.102, talloc 2.5.0 and libandroid-shmem 0.7 source archives, plus complete Termux recipe/build-system snapshots at their version-update commits. These include package patches, configuration, compiler setup and helper scripts. Compiler/SDK distributions remain separately obtainable build tools.
- `node/`: Node 24.20.0 complete upstream source archive, including bundled dependency sources, and its upstream checksum list.
- `inventories/`: the original installed-package status from each verified Ubuntu binary image.
- `notices/`: original Ubuntu documentation and common license texts for both architectures, original Node binary licenses, Termux package license metadata, and complete native license texts. Ubuntu documentation symlinks are recorded in `symlinks.json`; their target notice files are also copied when present in the image.
- `olea/`: the runtime assembly/launch recipes, input hashes, source-download lock, replacement instructions and MIT license. The full Android application and backend source are distributed separately through the matching Olea release's public source tag/archive.
- `SHA256SUMS`: SHA-256 values for every included regular file except this checksum file itself.

Verify an extracted companion on Linux:

```sh
cd olea-0.1.0-runtime-source
sha256sum -c SHA256SUMS
```

Use the outer archive checksum published alongside the APKs to check the archive before extraction. SHA-256 verification here establishes byte correspondence with upstream HTTPS indexes/recipes; it is not a claim of independent signature validation or reproducible binary builds.

## Recreate the companion

In the matching full Olea checkout, provide the exact cached runtime binary inputs using the existing `runtime/build.sh` process for each ABI. Building an APK is not required if those verified download caches are already available. Then run:

```sh
node runtime/source/assemble.mjs
```

Requires Node 24, curl, GNU tar with gzip/xz support, and enough free space for approximately 0.5 GB of source downloads plus staging and the output archive. On Windows, Git Bash supplies the archive tools. The script uses four download connections, verifies every source-file hash/size before use, verifies all ten binary input hashes before extracting notices, and runs no downloaded source code. Its output stays under the checkout's `.setup/release-010/redistribution/` directory:

- `olea-0.1.0-runtime-source.tar.gz`
- `olea-0.1.0-runtime-NOTICES.txt`
- `artifact.json` with artifact hashes and sizes

The source lock is fixed for this release. For another binary revision, derive its own inventory and source lock rather than reusing this archive.

## Build or modify upstream components

Ubuntu source packages unpack with `dpkg-source -x package_version.dsc` from their directory. This applies the included Debian/Ubuntu changes. Build dependencies and target configuration are in `debian/control` and `debian/rules`; build on Ubuntu noble for the corresponding architecture using `dpkg-buildpackage` or a suitable cross-build environment. Package-specific documentation and license exceptions are in the included sources and notices. Downloaded build dependencies are not included as binaries in this companion.

Node's source archive includes `BUILDING.md`, `configure`, dependency sources and build rules. Build against the target Linux/glibc architecture, not Android's bionic libc, because Node runs inside the Ubuntu guest.

For the native Android components and library replacement, follow [RELINKING.md](RELINKING.md). This archive includes editable source and recipes; it does not claim that a newly built binary will be byte-identical to Termux's prebuilt package.

## Distribution

Provide this companion and `olea-0.1.0-runtime-NOTICES.txt` as directly downloadable assets on the same release page as each matching APK, with their checksums and a prominent source/notices link beside the APK links. Keep those source downloads available wherever the matching APKs remain downloadable. Preserve notices inside the guest and Node distributions. Include native notices in the app's About/legal materials or provide the accompanying notice file with every APK copy.

This route supplies source directly under GPLv2 section 3(a)'s download-equivalence paragraph and GPLv3 section 6(d), including applicable LGPL source duties. It does not depend on an upstream URL alone, a future written offer, or recipients having to request source. If APKs are mirrored, moved, or supplied outside this release page, also supply the companion/notices or establish an equivalent source distribution route for that delivery.
