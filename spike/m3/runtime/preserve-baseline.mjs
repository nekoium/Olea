// SPDX-License-Identifier: MIT
import { device } from '../../m2/runtime/bridge.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
mkdirSync('.setup', {recursive:true});
const shell = s => device(['shell',s]);
const report={at:new Date().toISOString(),processes:shell('ps -A -o UID,PID,PPID,NAME').split('\n').filter(l=>/^\s*1021[678]\s/.test(l)),artifacts:[]};
for(const name of ['runtime','fixture','repeat']) {
 const packageName=`dev.olea.m2.${name}`;
 const source=shell(`pm path ${packageName}`).trim().replace(/^package:/,'');
 const destination=`.setup/installed-${name}.apk`;
 device(['pull',source,destination]);
 const bytes=(await import('node:fs')).readFileSync(destination);
 report.artifacts.push({package:packageName,source,destination,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});
}
report.hashes=shell("run-as dev.olea.m2.runtime sh -c 'find files/rootfs -type f \\( -name combined-value.txt -o -name sentinel -o -name olea-provider.json -o -name session.jsonl -o -name config.toml -o -name history.jsonl -o -name \"*rollout*\" \\) -exec sha256sum {} \\;; find files/rootfs -type d -name sessions'");
writeFileSync('spike/m3/runtime/evidence/baseline-preservation.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
