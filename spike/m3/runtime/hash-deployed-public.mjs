// SPDX-License-Identifier: MIT
// Read-only deployed public code hashes. Run only after manager releases the user-setup hold.
import { writeFileSync } from 'node:fs';
import { device } from '../../m2/runtime/bridge.mjs';
const attempt=process.argv[2];
if(!attempt||!/^[a-z0-9-]{1,64}$/.test(attempt)) throw new Error('unique_attempt_required');
const result=device(['shell',"run-as dev.olea.m2.runtime sh -c 'find files/rootfs/opt/olea-m3-a02/spike/backend/dist files/rootfs/opt/olea-m3-a02/spike/backend/extensions -type f -exec sha256sum {} \\;'"]);
writeFileSync(`spike/m3/runtime/evidence/${attempt}-deployed-public-hashes.txt`,result,{flag:'wx'});
console.log(`Saved ${attempt} public deployment hashes`);
