// SPDX-License-Identifier: MIT
// Bounded existing native-probe collector; never replays an attempt.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {device} from '../../m2/runtime/bridge.mjs';
const attempt=process.argv[2];assert(/^[a-z0-9-]+$/.test(attempt));
let text;const end=Date.now()+55000;
while(Date.now()<end){const ready=device(['shell',`run-as dev.olea.m2.runtime sh -c 'if [ -f files/m2/${attempt}.json ]; then echo READY; fi'`]).trim();if(ready==='READY'){text=device(['exec-out','run-as','dev.olea.m2.runtime','cat',`files/m2/${attempt}.json`]);break;}await new Promise(r=>setTimeout(r,500));}
assert(text,'NOT_SETTLED_DO_NOT_REPLAY');const report=JSON.parse(text);writeFileSync(`spike/m4/runtime/evidence/${attempt}-native.json`,text,{flag:'wx'});console.log({attempt,exit:report.exitCode,idle:report.launchIdle,cleanup:report.cleanupVerified,stdout:report.stdout,stderr:report.stderr});
