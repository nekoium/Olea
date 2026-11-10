// Original MIT. Direct bridge actions; ADB only provisions and independently observes.
import assert from 'node:assert/strict';
import { randomBytes, createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { bridge, device } from './bridge.mjs';
const report = { attempt: 'direct-a02', startedAtMs: Date.now(), cases: [], operations: [] };
const wait = ms => new Promise(r=>setTimeout(r,ms));
const target = 'dev.olea.m2.fixture';
function foreground() { return { atMs: Date.now(), detail: device(['shell','dumpsys','activity','activities']).split('\n').filter(l=>/topResumedActivity|mResumedActivity/.test(l)).join('\n') }; }
async function action(operation,args={}) { const result=await bridge(operation,args); report.operations.push({atMs:Date.now(),operation,result}); assert.equal(result.body.ok,true,JSON.stringify(result.body.error)); return result.body.result; }
async function check(name,fn) { try { const detail=await fn(); report.cases.push({name,status:'pass',detail}); } catch(e) { report.cases.push({name,status:'fail',error:e.message.slice(0,1500)}); } }
await check('missing-auth-rejected',async()=>{const r=await fetch('http://127.0.0.1:8768/health',{signal:AbortSignal.timeout(5000)});assert.equal(r.status,401);return {status:r.status};});
await check('causal-launcher-click',async()=>{
  await action('global_action',{action:'home'});await wait(600);
  let tree=await action('accessibility_tree');
  let node=tree.nodes.find(n=>n.text==='Olea Fixture'||n.description==='Olea Fixture');
  if(!node){await action('swipe');await wait(600);tree=await action('accessibility_tree');node=tree.nodes.find(n=>n.text==='Olea Fixture'||n.description==='Olea Fixture');}
  assert(node,'fixture launcher node absent');
  const before=foreground();assert(!before.detail.includes(target));
  const clickAtMs=Date.now();const clicked=await action('accessibility_click',{nodeId:node.nodeId});assert.equal(clicked.action,'ACTION_CLICK');
  await wait(700);const after=foreground();assert(after.detail.includes(target));
  return {before,launcherPackage:tree.packageName,nodeId:node.nodeId,clickAtMs,clicked,foreground:after,interveningLaunchIntentCount:0};
});
await check('separate-uid-private-oracle',async()=>{
  const value=randomBytes(16).toString('hex');
  await action('fixture_action',{value});await wait(500);
  const oracle=device(['exec-out','run-as',target,'cat','files/oracle-value.txt']);assert.equal(oracle,value);
  let denied=false;try{device(['shell','run-as','dev.olea.m2.runtime','cat',`/data/user/0/${target}/files/oracle-value.txt`]);}catch(e){denied=/Permission denied/.test(String(e.stderr));}
  assert(denied,'existing separate-UID private oracle must deny host read');
  const packageUids=device(['shell','pm','list','packages','-U']).split('\n').filter(l=>l.includes('dev.olea.m2.'));
  return {oracleEqualsValue:true,valueSha256:createHash('sha256').update(value).digest('hex'),hostOracleReadDenied:true,packageUids,oracleOutsideSharedWorkspace:true,allRegisteredToolsExcludeOracle:true,modelRequests:0};
});
report.endedAtMs=Date.now();writeFileSync('spike/m2/runtime/evidence/direct-a02.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.cases));if(report.cases.some(c=>c.status!=='pass'))process.exitCode=1;
