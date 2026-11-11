// SPDX-License-Identifier: MIT
// Read-only correction of a redacted observer; no native/model/notification replay.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {device} from '../../m2/runtime/bridge.mjs';
const prior=JSON.parse(readFileSync('spike/m3/runtime/evidence/categories-independent-a01.json','utf8'));
const preflight=JSON.parse(readFileSync('spike/m3/runtime/evidence/categories-preflight-a01.json','utf8'));
const model=JSON.parse(readFileSync('spike/m3/runtime/evidence/codex-location-notification-a01.json','utf8'));
const native=JSON.parse(readFileSync('spike/m3/runtime/evidence/codex-location-notification-a01-native.json','utf8'));
const report={attempt:'notification-oracle-a02',at:new Date().toISOString(),prior:'categories-independent-a01.json',reason:'Default dumpsys notification redacts extras text; retain original failed observer assertion and collect same fixture record with --noredact',modelRequests:0,nativePhoneOperations:0,notificationPosts:0};
try{
 const lines=device(['shell','dumpsys notification --noredact']).split('\n');
 const index=lines.findIndex(l=>l.includes('NotificationRecord(')&&l.includes('pkg=dev.olea.m2.fixture'));
 assert(index>=0);let end=lines.findIndex((l,i)=>i>index&&l.includes('NotificationRecord('));if(end<0)end=Math.min(lines.length,index+160);
 report.independentFixtureRecord=lines.slice(index,end).join('\n');
 assert(report.independentFixtureRecord.includes('uid=10217'));assert(report.independentFixtureRecord.includes('id=42'));assert(report.independentFixtureRecord.includes('OLEA_NOTIFICATION_FIXTURE'));
 assert.equal(preflight.notifications.body.result.notifications.length,0);
 assert(prior.fixtureLaunchAfter.startsWith(preflight.fixtureLaunchBaseline));
 report.launchDelta=prior.fixtureLaunchAfter.slice(preflight.fixtureLaunchBaseline.length).trim().split(/\r?\n/).filter(Boolean);assert.equal(report.launchDelta.length,1);
 const postedAt=Number(report.launchDelta[0].split(' ')[0]);assert(postedAt>=native.startedAtMs&&postedAt<=native.endedAtMs);
 const notify=prior.nativeOperations.find(r=>r.operation==='fixture_notify');const read=prior.nativeOperations.find(r=>r.operation==='notifications');assert(notify.atMs<=postedAt+100&&postedAt<=read.atMs);
 const tool=model.toolReceipts.find(r=>r.tool==='phone_notifications');report.modelNotification=JSON.parse(JSON.parse(tool.output).content[0].text).notifications;
 assert.deepEqual(report.modelNotification,[{package:'dev.olea.m2.fixture',id:42,text:'OLEA_NOTIFICATION_FIXTURE'}]);
 report.causalOrdering={nativeNotifyAt:notify.atMs,separateFixtureAt:postedAt,nativeReadAt:read.atMs};
 report.status='pass';
 report.scope='Same new causal separate-UID post observed from empty listener baseline, fixture-launch append, exact model tool result and independent notification-manager package/UID/id/text; actual post repeated0times';
}catch(e){report.status='fail';report.error=e.message;}
writeFileSync('spike/m3/runtime/evidence/notification-oracle-a02.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log({status:report.status,error:report.error,ordering:report.causalOrdering});
