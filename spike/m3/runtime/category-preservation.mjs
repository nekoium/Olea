// SPDX-License-Identifier: MIT
import {readFileSync,writeFileSync} from 'node:fs';
import {device} from '../../m2/runtime/bridge.mjs';
const model=JSON.parse(readFileSync('spike/m3/runtime/evidence/codex-location-notification-a01.json','utf8'));
const prior=JSON.parse(readFileSync('spike/m3/runtime/evidence/backend-recovery-a02.json','utf8')).historyBefore;
const report={at:new Date().toISOString(),modelRequests:0,earlierDiagnosticFailure:'Read-only compound find command lost shell parentheses escaping before hash output; corrected by hashing each explicit previously recorded public path, no model/native action replay'};
const historical=prior.trim().split(/\r?\n/).map(line=>{const [expected,path]=line.split(/\s+/,2);const actual=device(['shell','run-as','dev.olea.m2.runtime','sha256sum',path]).trim().split(/\s+/)[0];return {path,expected,actual,equal:expected===actual};});
report.historicalCanonicalHashes=historical;report.historicalCanonicalHashesUnchanged=historical.every(r=>r.equal);
const files=device(['shell','run-as','dev.olea.m2.runtime','find',`files/rootfs/workspace/${model.attempt}/state`,'-type','f']).trim().split(/\r?\n/).filter(p=>p.endsWith('/thread.json')||/\/rollout-[^/]+\.jsonl$/.test(p));
report.newCanonicalSessionHashesAfterResume=files.map(path=>device(['shell','run-as','dev.olea.m2.runtime','sha256sum',path]).trim());
writeFileSync('spike/m3/runtime/evidence/categories-session-preservation-a01.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log({historicalUnchanged:report.historicalCanonicalHashesUnchanged,newSessionFiles:files.length});
