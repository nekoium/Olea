# Third-party runtime inputs

The local build uses the upstream Linux/PRoot route for separately selected `x86_64` and `arm64-v8a` APKs. [Input manifest](upstream-inputs.json) pins both architectures' versions, URLs and SHA-256 values for the maintained `dev.olea.app` application. Set `OLEA_ABI=arm64-v8a` or `OLEA_ABI=x86_64` when running `runtime/build.sh`; x86_64 remains the default. Each APK contains one selected guest and matching native ABI.

[Upstream checksum excerpts](checksums/2026-11-13-upstream.txt) record the exact Ubuntu/Node checksum lines and Termux package-index stanzas used to establish the pins. These were retrieved from the upstream HTTPS authorities, including both Termux architecture indexes. No independent signing-key or GPG verification is claimed. ELF checks establish archive/native architecture before packaging; APK checks compare packaged archive and native bytes to the verified build inputs.

- Ubuntu Base 24.04.3 amd64/arm64: mixed licenses. Packaged copyright notices remain under the guest `/usr/share/doc`; applicable corresponding source obligations remain.
- Node 24.20.0 Linux x64/arm64: MIT plus bundled notices. Original Node archive bytes are verified before deterministic gzip repackaging; `/opt/node/LICENSE` remains included.
- Termux PRoot 5.1.107.102: GPL-2.0. Native bytes are renamed for Android PackageManager extraction, without binary modification. Source: https://github.com/termux/proot.
- libtalloc 2.5.0: LGPL-3.0-or-later. Source: https://talloc.samba.org/. Corresponding source and relinking requirements need attention before distribution.
- libandroid-shmem 0.7: BSD-3-Clause. Source: https://github.com/termux/libandroid-shmem.
- Pi 1.5.2: installed on-device through npm, with its upstream package license and dependency notices. No private agent source fork is included.
- Gradle 9.1.0, Android Gradle Plugin 9.0.0, TypeScript and Node type declarations are build tools, not the app's Linux execution layer.

This is an inventory for a local build, not distribution clearance. Before publishing any runtime-bearing APK, retain required notices and arrange corresponding source/relinking materials for the exact distributed components. No publication is part of the maintained-core assignment.

Original maintained source selectively reuses MIT Olea spike adapters, process ownership checks and Debian archive extraction. Experiment runners, fixtures, credentials and saved experimental data are not packaged.
