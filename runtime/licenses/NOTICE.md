# Native runtime notices

Olea 0.1.0 includes the following software. Its original MIT license does not relicense these components.

## PRoot 5.1.107.102

Copyright (C) 2015 STMicroelectronics and the contributors identified in the accompanying source files.

The source headers permit GNU GPL version 2 or, at your option, any later version. `PRoot-COPYING` is the upstream license file. `GPL-2.txt` and `GPL-3.txt` provide the full license texts. The native PRoot/talloc combination uses the GPLv3-compatible distribution route described in `runtime/source/RELINKING.md`; upstream GPLv2 notices remain intact.

Exact source: `proot-v5.1.107.102.zip` in the release source companion. Upstream: https://github.com/termux/proot. Source archive commit recorded by GitHub: `52d65a4dc140ca554d241a1438ddd4f6b00c9813`. The source lock pins the archive bytes; the complete Termux version-update recipe/build tree is included as well.

## talloc 2.5.0

Copyright (C) Andrew Tridgell 2004

Copyright (C) Stefan Metzmacher 2006

These attributions are from `talloc.c`; further contributors and the included libreplace portability code retain their notices in the source companion.

The talloc library is licensed under GNU LGPL version 3 or, at your option, any later version. It is provided WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See `LGPL-3.txt` and its incorporated `GPL-3.txt` for the complete terms.

Olea uses this library in its native PRoot runtime. You may modify the library and reverse engineer the combined runtime to debug your modifications. Complete source, the corresponding PRoot application source and build/recombination instructions accompany the release. No Olea license term restricts those activities.

The Termux package recipe labels the package `GPL-3.0` and its copyright symlink targets `GPL-3.0.txt`. The library's own `talloc.c`, `talloc.h` and upstream `LICENSE` specify LGPL-3.0-or-later; this notice preserves that additional permission rather than silently relying on the package label. Both full GPLv3 and LGPLv3 texts accompany the binary.

Exact source: `talloc-2.5.0.tar.gz` in the release source companion. Upstream: https://www.samba.org/ftp/talloc/.

## libandroid-shmem 0.7

Copyright (c) 2013, Sergii Pylypenko

Copyright (c) 2017, Fredrik Fornwall

All rights reserved. BSD-3-Clause; see `libandroid-shmem-LICENSE` for the full conditions and disclaimer, copied verbatim from the source and matching the package notice. Neither the copyright holders' names nor contributors' names may be used for endorsement without permission.

Exact source: `libandroid-shmem-v0.7.tar.gz` in the release source companion. Upstream: https://github.com/termux/libandroid-shmem.

## Node 24.20.0

Copyright Node.js contributors. Node is MIT-licensed and incorporates software under additional licenses. `Node-LICENSE` is the complete upstream license and bundled notices from the verified binary distribution. It is not replaced by this summary. The same license file remains in the guest at `/opt/node/LICENSE`. Complete Node source, including bundled dependency sources, accompanies the release.

## Ubuntu Base 24.04.3

Ubuntu Base contains many separately licensed packages, including GPL, LGPL, BSD, MIT and other licenses and applicable exceptions. Preserve the complete package copyright notices under `/usr/share/doc` and standard texts under `/usr/share/common-licenses`. Architecture-specific copies are in the source companion, together with all 65 exact source-package versions and both original installed-package inventories. There is no single Ubuntu Base license or single license inferred for all its contents.

## Source availability

Obtain `olea-0.1.0-runtime-source.tar.gz` from the same Olea 0.1.0 release page as the APKs. It contains exact source packages, upstream packaging/build scripts, this notice and the full license texts. `runtime/source/source-lock.json` records URLs and SHA-256 values. `runtime/source/RELINKING.md` explains rebuilding, replacement and signing with your own key. The public Olea 0.1.0 source tag/archive separately supplies the full Android/backend source.
