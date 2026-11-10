// Original MIT. Read-only independent checks for the single approved no-model full-access case.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { device } from './bridge.mjs';
const dir='spike/m2/runtime/evidence/';
const report=JSON.parse(readFileSync(dir+'codex-full-access-a01.json'));
const native=JSON.parse(readFileSync(dir+'codex-full-access-a01-native.json'));
const before=JSON.parse(readFileSync(dir+'codex-full-access-a01-before-capabilities.json')).body.result;
const after=JSON.parse(readFileSync(dir+'codex-full-access-a01-after-capabilities.json')).body.result;
assert.equal(report.accessMode,'full-access');assert.equal(report.stockSandbox,'danger-full-access');assert.equal(report.approvalPolicy,'never');assert.equal(report.filesystemIsolation,false);
assert.equal(report.noModelRequests,true);assert.equal(report.noPhoneActions,true);assert.equal(native.targetSdk,36);assert.equal(native.hostRealUid,10216);assert.match(native.hostDomain,/^u:r:untrusted_app:/);
assert.equal(native.deadlineSeconds,35);assert.equal(native.timedOut,false);assert.equal(native.exitCode,0);
assert.equal(before.phoneEnabled,false);assert.equal(after.phoneEnabled,false);assert.equal(after.backendRunning,false);
assert.match(report.directory,/^\/opt\/olea\/\.setup\/codex-full-access\/attempt-[a-zA-Z0-9]+$/);
const outputs=[];
for(const [name,suffix] of [['inside','workspace/inside.txt'],['sibling','outside.txt']]){
 const result=report.results[name==='sibling'?'outside':name];assert.equal(result.exitCode,0);assert.equal(result.stdout,'OK');assert.equal(result.independentExact,true);
 const path=`files/rootfs${report.directory}/${suffix}`;
 const value=device(['exec-out','run-as','dev.olea.m2.runtime','cat',path]);assert.equal(value,'EXPLICIT_FULL_ACCESS_OK');
 outputs.push({name,path,exactMatch:true,bytes:Buffer.byteLength(value),sha256:createHash('sha256').update(value).digest('hex')});
}
const proof={status:'pass',accessMode:'full-access',filesystemIsolation:false,siblingWriteExpected:true,syntheticProviderVariableAbsentInBothCommands:true,noModelRequests:true,noPhoneActions:true,actualHostPid:native.hostPid,actualHostUid:native.hostRealUid,actualHostDomain:native.hostDomain,serviceWallMs:native.endedAtMs-native.startedAtMs,rootExitObserved:native.rootExitObserved,adapterRootExited:report.stop.rootExited,adapterDescendantsVerified:report.stop.descendantsVerified,outputs,phoneEnabledBefore:false,phoneEnabledAfter:false,limits:['Sibling write demonstrates no workspace filesystem isolation; same-UID app-private files and credentials are not isolated','Exit0 with synthetic marker guard proves only environment-variable exclusion, not file secrecy','Post-case UID-filtered process snapshot shows hosts/fixture only; no descendant identity guarantee beyond supplied evidence','No provider/model/phone workflow or approval exercise was run']};
writeFileSync(dir+'codex-full-access-a01-independent.json',JSON.stringify(proof,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:proof.status,serviceWallMs:proof.serviceWallMs,filesystemIsolation:false,noModelRequests:true,noPhoneActions:true}));
