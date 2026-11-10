// Original MIT. Read-only assessment of the single submitted Codex Unix turn; no provider or phone effect.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { device } from './bridge.mjs';
const dir='spike/m2/runtime/evidence/';
const r=JSON.parse(readFileSync(dir+'codex-full-access-unix-a01.json'));
const native=JSON.parse(readFileSync(dir+'codex-full-access-unix-a01-native.json'));
assert.equal(r.topLevelPrompts,1);assert.equal(r.scope,'android-app-domain');assert.equal(r.model,'gpt-6.1-terra');assert.equal(r.accessMode,'full-access');assert.equal(r.filesystemIsolation,false);assert.equal(r.approvalPolicy,'never');
for(const key of ['initializedThread','completedTurn','unixWorkflow','resume'])assert.equal(r.outcomes[key],'pass');
assert(Object.values(r.assertions).every(v=>v===true));assert.equal(r.turn.status,'completed');assert.equal(r.turn.id,r.ack.turn.id);assert.equal(r.start.threadId,r.resume.threadId);assert.equal(r.start.cwd,r.resume.cwd);assert.equal(r.start.home,r.resume.home);assert.equal(r.resume.accessMode,'full-access');
assert.equal(native.targetSdk,36);assert.equal(native.hostRealUid,10216);assert.match(native.hostDomain,/^u:r:untrusted_app:/);assert.equal(native.exitCode,0);assert.equal(native.timedOut,false);
assert(r.toolReceipts.length>=1);assert(r.toolReceipts.every(t=>t.type==='commandExecution'&&t.exitCode===0));assert(!r.items.mcpToolCall);
const after=JSON.parse(readFileSync(dir+'codex-full-access-unix-a01-after-capabilities.json')).body.result;assert.equal(after.phoneEnabled,false);assert.equal(after.backendRunning,false);
assert.match(r.workspace,/^\/opt\/olea\/evidence\/attempt-[a-zA-Z0-9-]+\/workspace$/);
const resultBytes=device(['exec-out','run-as','dev.olea.m2.runtime','cat',`files/rootfs${r.workspace}/result.json`]);
const result=JSON.parse(resultBytes);assert.equal(result.dependency,true);assert.equal(result.child,'42');assert.equal(result.secretAbsent,true);
const toolReadback=r.toolReceipts.find(t=>t.command.includes('cat result.json'));assert(toolReadback);assert.deepEqual(result,JSON.parse(toolReadback.output));
const artifactHashes=[];
for(const suffix of ['result.json','child-check.cjs','package-lock.json','node_modules/is-number/package.json']){
 const value=device(['exec-out','run-as','dev.olea.m2.runtime','cat',`files/rootfs${r.workspace}/${suffix}`]);
 artifactHashes.push({path:`${r.workspace}/${suffix}`,bytes:Buffer.byteLength(value),sha256:createHash('sha256').update(value).digest('hex')});
}
const total=r.usage.at(-1)?.total;
const proof={status:'pass',allocationId:'m2-android-codex-unix-01',topLevelPrompts:1,model:r.model,scope:r.scope,accessMode:r.accessMode,filesystemIsolation:false,approvalPolicy:r.approvalPolicy,hostPid:native.hostPid,hostRealUid:native.hostRealUid,hostStartTicks:'150689',hostDomain:native.hostDomain,threadId:r.start.threadId,turnId:r.turn.id,terminal:r.turn.status,streamedAgentMessageDeltas:r.events['item/agentMessage/delta'],observedCommandExecutions:r.items.commandExecution,observedFileChangeItems:r.items.fileChange,actualToolExitCodes:r.toolReceipts.map(t=>t.exitCode),allRunnerIndependentAssertions:true,hostExactToolReadbackMatch:true,canonicalResume:{sameThread:true,sameHome:true,sameWorkspace:true,sameAccessMode:true},artifactHashes,lastCumulativeUsage:total,usageAggregation:'Last cumulative total only; repeated tokenUsage snapshots are not summed',reconnectErrorNotifications:r.errors.filter(e=>e==='Reconnecting... waiting for network').length,configuredRequestRetries:r.requestRetries,configuredStreamRetries:r.streamRetries,automaticRunnerReplay:false,actualHttpRequests:null,remoteBilling:'unknown',elapsedMs:r.elapsedMs,phoneEnabledAfter:false,noObservedMcpToolCalls:true,limits:['Two stock reconnect notifications occurred despite configured request/stream retries0; HTTP/protocol request counts are unavailable, so zero internal transport reconnect attempts is not claimed','Usage has7 notifications including duplicate final total; six changing cumulative totals are observed, not an exact HTTP count','Stock completed command receipts plus fresh independent dependency/child execution establish real behavior; named model child process identity/exit not separately sampled','Numeric adapter UID0 is PRoot emulation; native service realUID10216/domain separately establishes Android authority','Post-case listed hosts/fixture only does not establish generic descendant cleanup guarantee','Full access provides no same-UID filesystem/credential isolation; secretAbsent is child environment absence only','No phone action, approval exercise, cancel experiment or agent update in this case']};
writeFileSync(dir+'codex-full-access-unix-a01-independent.json',JSON.stringify(proof,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:proof.status,topLevelPrompts:1,commandExecutions:proof.observedCommandExecutions,resume:true,usage:total,reconnectNotifications:proof.reconnectErrorNotifications}));
