// SPDX-License-Identifier: MIT
// Deterministic readiness only; no provider configuration read or model submission.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {device,bridge,nativeRequest} from '../../m2/runtime/bridge.mjs';
const shell=s=>device(['shell',s]);const wait=ms=>new Promise(r=>setTimeout(r,ms));
const report={attempt:'categories-preflight-a01',startedAt:Date.now(),allocation:'m3-codex-location-notification-01',modelRequests:0,developmentSetup:'Native enable-once flag and explicit host restart; no Accessibility/folder/capture consent provisioned'};
try {
 const prefix='files/rootfs/opt/olea-m3-categories-a01/';
 const paths=['spike/tests/codex/run-stock.mjs','spike/m3/runtime/grouped-phone-prompt.mjs','spike/m3/runtime/codex-location-notification-options.json',...['backend.js','codex-process.js','codex-session.js','phone-mcp.js','pi-process.js','process-tree.js','server.js'].map(n=>'spike/backend/dist/'+n),'spike/backend/extensions/phone.ts'];
 report.deployedHashes=[];
 for(const path of paths){const expected=createHash('sha256').update(readFileSync(path)).digest('hex');const actual=shell(`run-as dev.olea.m2.runtime sha256sum ${prefix+path}`).trim().split(/\s+/)[0];assert.equal(actual,expected);report.deployedHashes.push({path,expected,actual});}
 report.allocationUnclaimed=shell("run-as dev.olea.m2.runtime sh -c 'test ! -e files/rootfs/run/m3-codex-location-notification-01.started && echo UNCLAIMED'").trim();assert.equal(report.allocationUnclaimed,'UNCLAIMED');
 report.protectedModes=shell("run-as dev.olea.m2.runtime stat -c '%a %n' files/rootfs/run/olea-provider.json files/bridge-token files/bridge-config.json");assert(report.protectedModes.trim().split('\n').every(l=>l.startsWith('600 ')));
 report.enableFlag=shell("run-as dev.olea.m2.runtime sh -c 'touch files/enable-phone-once'");report.stop=shell('am force-stop dev.olea.m2.runtime');report.launch=shell('am start -f 0x18000000 -n dev.olea.m2.runtime/dev.olea.spike.MainActivity');await wait(800);
 report.capabilities=await nativeRequest('/capabilities');assert.equal(report.capabilities.body.result.phoneEnabled,true);assert.equal(report.capabilities.body.result.backendRunning,false);
 report.permissions=shell('dumpsys package dev.olea.m2.runtime; dumpsys package dev.olea.m2.fixture').split('\n').filter(l=>/ACCESS_FINE_LOCATION: granted=|POST_NOTIFICATIONS: granted=/.test(l)).join('\n');
 report.location=await bridge('location');assert.equal(report.location.body.ok,true);const p=report.location.body.result;assert(Number.isFinite(p.latitude)&&Math.abs(p.latitude)<=90&&Number.isFinite(p.longitude)&&Math.abs(p.longitude)<=180&&p.accuracy>=0);
 report.independentLocation=shell('dumpsys location').split('\n').filter(l=>/last location=Location\[gps/.test(l)).join('\n');assert(report.independentLocation.includes('24.987600,121.543198'));assert(Math.abs(p.latitude-24.9876)<0.0001&&Math.abs(p.longitude-121.5432)<0.0001);
 report.notifications=await bridge('notifications');assert.equal(report.notifications.body.ok,true);assert.equal(report.notifications.body.result.notifications.length,0);
 report.fixtureUid=shell('pm list packages -U dev.olea.m2.fixture');assert(report.fixtureUid.includes('10217'));
 report.fixtureLaunchBaseline=device(['exec-out','run-as','dev.olea.m2.fixture','cat','files/observed-launches.txt']);
 report.notificationBaseline=shell('dumpsys notification').split('\n').filter(l=>l.includes('NotificationRecord(')&&l.includes('pkg=dev.olea.m2.fixture')).join('\n');
 report.auditBaseline=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/phone-audit.jsonl']);
 report.stockCodexVersion=shell('run-as dev.olea.m2.runtime ls files/rootfs/opt/agents/codex/node_modules/@openai/codex/bin/codex.js');
 report.status='ready';
}catch(e){report.status='failed_prerequisite';report.error=e.message;}
finally{report.endedAt=Date.now();writeFileSync('spike/m3/runtime/evidence/categories-preflight-a01.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log({status:report.status,error:report.error,location:report.location?.body?.result,notifications:report.notifications?.body?.result});}
