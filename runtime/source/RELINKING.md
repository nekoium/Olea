# Rebuild and replace the native runtime

Olea 0.1.0 uses talloc 2.5.0, licensed LGPL-3.0-or-later, in its native PRoot runtime. You may modify that library and reverse engineer the combined runtime to debug your modifications. Olea imposes no contractual restriction on those activities. The library's license, GPLv3 text, copyright notice, complete source and build recipes accompany the release.

PRoot is a separate executable, launched by the Android app. Its sources permit GPL-2.0-or-later. For the PRoot/talloc linked combination, the provided distribution route uses GPLv3's compatible terms for PRoot and LGPLv3 for the library. The original PRoot GPLv2 text/notices also remain included. Merely renaming these ELF files to `lib*.so` for Android extraction does not change their license.

## Source and build recipe

The companion contains:

| Component | Source | Termux recipe/build-system commit |
| --- | --- | --- |
| PRoot 5.1.107.102 | `termux/proot-v5.1.107.102.zip` | `b734bc49dc0eedb2c454e1c5d3c48d35d81d4bc9` |
| talloc 2.5.0 | `termux/talloc-2.5.0.tar.gz` | `bddd9721910e56bc36412a764b4b4f7bbdbb1eb1` |
| libandroid-shmem 0.7 | `termux/libandroid-shmem-v0.7.tar.gz` | `b25e257208da6d2e8b558b8a2b51762158a2e806` |

Each accompanying `*-termux-packages-COMMIT.tar.gz` is the complete build-system tree, including package recipes, patches, NDK/toolchain setup and Docker helper. These commits are the upstream version-update commits; they are not an attestation identifying every build-machine setting used for the prebuilt `.deb` files. Binary hashes are pinned separately.

On a Linux Docker build host, extract the PRoot Termux build tree. Its recipes already select these three versions. For example, from the extracted `termux-packages-b734...` directory:

```sh
./scripts/run-docker.sh ./build-package.sh -a aarch64 libandroid-shmem
./scripts/run-docker.sh ./build-package.sh -a aarch64 libtalloc
./scripts/run-docker.sh ./build-package.sh -a aarch64 proot
```

Use `x86_64` instead of `aarch64` for the other ABI. To use each component's original recipe snapshot independently, run its build from its own included tree. Read that tree's README and `build-package.sh --help` for host setup. These commands run upstream build code and obtain the toolchains/build dependencies specified by that tree. They are instructions, not a claim that this release worker rebuilt either architecture.

To build modified sources, unpack the included component archive, make your changes, and set that component recipe's `TERMUX_PKG_SRCURL` to the local directory using `file:///absolute/path/to/modified-source`, which the included Termux downloader supports. For a Docker build, place modified sources under the mounted Termux checkout and use their corresponding container path. An unchanged included archive may instead use `file:///absolute/path/to/archive` with its original recipe checksum. Keep the library's exported interface/SONAME compatible with `libtalloc.so.2` or rebuild PRoot with the changed interface too.

Extract your new talloc `.deb` with `ar x` and `tar -xJf data.tar.xz` in an empty directory. The library is `data/data/com.termux/files/usr/lib/libtalloc.so.2.5.0`. PRoot outputs are `bin/proot` and `libexec/proot/loader{,32}` below the same prefix. The published runtime copies these files without changing their binary bytes:

| Termux file | APK file under `lib/ABI/` |
| --- | --- |
| `bin/proot` | `libproot.so` |
| `libexec/proot/loader` | `libloader.so` |
| `libexec/proot/loader32` | `libloader32.so` |
| `lib/libtalloc.so.2.5.0` | `libtalloc.so` |
| `lib/libandroid-shmem.so` | `libandroid-shmem.so` |

`runtime/linux.sh` preloads the packaged talloc/shmem libraries and launches PRoot. There is no Olea native checksum/signature check that rejects a changed library. `runtime/upstream-inputs.json` hashes select the original release inputs; `runtime/build.sh` deliberately checks those pins and would replace an edited native file. Use the replacement route below after obtaining the original APK, or build the Android app directly with your replacement native files.

## Repackage with an interface-compatible talloc

Use a separate empty directory. Requires Info-ZIP, Android SDK Build Tools 36 or later (`zipalign`, `apksigner`), and your own APK signing key. Set `abi` to `arm64-v8a` or `x86_64` matching both the APK and the rebuilt library:

```sh
abi=arm64-v8a
mkdir -p "lib/$abi"
cp /path/to/rebuilt/libtalloc.so.2.5.0 "lib/$abi/libtalloc.so"
cp /path/to/olea-0.1.0-arm64-v8a.apk modified-unsigned.apk
zip -d modified-unsigned.apk \
  'META-INF/*.SF' 'META-INF/*.RSA' 'META-INF/*.DSA' 'META-INF/*.EC' \
  'META-INF/MANIFEST.MF' "lib/$abi/libtalloc.so"
zip -X modified-unsigned.apk "lib/$abi/libtalloc.so"
zipalign -P 16 -f 4 modified-unsigned.apk modified-aligned.apk
apksigner sign --ks /path/to/your-own-key.jks \
  --out modified-signed.apk modified-aligned.apk
apksigner verify --verbose modified-signed.apk
```

The deletion command always targets the existing talloc entry, even when the original APK has no JAR/v1 signatures. It does not remove other `META-INF` license/notice files. `apksigner` replaces the APK signature; the original publisher's signing key is not needed. Keep your own signing key for updates to your modified build. This creates an independently signed modified APK; it does not preserve the official signature.

Android rejects an update signed by a different key. Do not uninstall an existing installation containing data without first exporting and verifying the data you need. You can install the modified APK on a device without Olea, or build the MIT Android application from the matching public source with your own application ID and key so it can coexist with the official app. Follow the full source's build instructions, change Gradle's `applicationId` consistently with any app-owned authorities, and package the replacement library under the matching ABI. Sideload the resulting APK through Android's normal install UI after allowing installs for your file manager/browser. No root, bootloader unlock, publisher key or provider subscription is required to install the application; using a particular agent may have its own setup requirements.

These source and application-code materials implement the LGPLv3 section 4(d)(0) recombination route. The packaging instructions also address installation of your rebuilt runtime. This work verifies source/archive correspondence and the existing dynamic loading mechanism; it does not establish modified-library execution on every Android device.
