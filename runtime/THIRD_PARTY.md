# Third-party runtime inputs

The initial local build reuses the verified upstream route documented by the spike. [Input manifest](upstream-inputs.json) retains original versions, URLs and SHA-256 values; its historical package identity describes the spike, not the maintained `dev.olea.app` application.

- Ubuntu Base 24.04.3 amd64: mixed licenses. Packaged copyright notices remain under the guest `/usr/share/doc`; applicable corresponding source obligations remain.
- Node 24.20.0 Linux x64: MIT plus bundled notices. Original Node archive bytes are verified before deterministic gzip repackaging; `/opt/node/LICENSE` remains included.
- Termux PRoot 5.1.107.102: GPL-2.0. Native bytes are renamed for Android PackageManager extraction, without binary modification. Source: https://github.com/termux/proot.
- libtalloc 2.5.0: LGPL-3.0-or-later. Source: https://talloc.samba.org/. Corresponding source and relinking requirements need attention before distribution.
- libandroid-shmem 0.7: BSD-3-Clause. Source: https://github.com/termux/libandroid-shmem.
- Pi 1.5.2: installed on-device through npm, with its upstream package license and dependency notices. No private agent source fork is included.
- Gradle 9.1.0, Android Gradle Plugin 9.0.0, TypeScript and Node type declarations are build tools, not the app's Linux execution layer.

This is an inventory for a local build, not distribution clearance. Before publishing any runtime-bearing APK, retain required notices and arrange corresponding source/relinking materials for the exact distributed components. No publication is part of the maintained-core assignment.

Original maintained source selectively reuses MIT Olea spike adapters, process ownership checks and Debian archive extraction. Experiment runners, fixtures, credentials and saved experimental data are not packaged.
