// SPDX-License-Identifier: MIT
// Direct operations through Kotlin; ADB provisions permissions and measures independent outcomes.
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { device, bridge } from '../../m2/runtime/bridge.mjs';
const report={attempt:'direct-categories-a01',startedAt:Date.now(),modelRequests:0,provisioning:[],cases:[],operations:[]};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const shell=s=>device(['shell',s]);
async function action(operation,args={}){const r=await bridge(operation,args);report.operations.push({at:Date.now(),operation,args,response:r});return r;}
async function check(name,fn){try{report.cases.push({name,status:'pass',detail:await fn()});}catch(e){report.cases.push({name,status:'fail',error:e.message});}}
function provision(command){const result=shell(command);report.provisioning.push({at:Date.now(),command,result,scope:'Development setup, not ordinary user consent'});return result;}
try {
 provision("run-as dev.olea.m2.runtime sh -c 'umask 077; touch files/enable-phone-once'");
 provision('am start -f 0x18000000 -n dev.olea.m2.runtime/dev.olea.spike.MainActivity');
 await wait(700);
 report.baseline=await bridge('capabilities');
 await check('location-denied-before-development-grant',async()=>{const r=await action('location');assert.equal(r.body.error?.code,'LOCATION_PERMISSION_DENIED');return r;});
 provision('pm grant dev.olea.m2.runtime android.permission.ACCESS_FINE_LOCATION');
 provision('pm grant dev.olea.m2.runtime android.permission.ACCESS_COARSE_LOCATION');
 // One call registers the existing bounded listener. The following injection and read are a planned prerequisite sequence, not effect replay.
 report.locationRegistration=await action('location');
 report.geoInput={longitude:121.5654,latitude:25.0330,result:device(['emu','geo','fix','121.5654','25.0330'])};
 await wait(1500);
 await check('structured-location-coordinate-oracle',async()=>{const r=await action('location');assert.equal(r.body.ok,true);const p=r.body.result;assert(Math.abs(p.latitude-25.0330)<0.0001);assert(Math.abs(p.longitude-121.5654)<0.0001);assert(p.ageMs>=0&&p.ageMs<5000);assert(p.accuracy>=0);return {location:p,independentInput:report.geoInput};});
 await check('notification-denied-before-development-grant',async()=>{const r=await action('notifications');assert.equal(r.body.error?.code,'NOTIFICATION_ACCESS_REVOKED');return r;});
 provision('pm grant dev.olea.m2.fixture android.permission.POST_NOTIFICATIONS');
 provision('cmd notification allow_listener dev.olea.m2.runtime/dev.olea.spike.FixtureNotifications');
 await wait(600);
 await check('separate-app-notification',async()=>{const before=await action('notifications');assert.equal(before.body.ok,true);const dispatchedAt=Date.now();const posted=await action('fixture_notify');assert.equal(posted.body.ok,true);await wait(700);const after=await action('notifications');const p=after.body.result?.notifications?.find(x=>x.package==='dev.olea.m2.fixture'&&x.id===42&&x.text==='OLEA_NOTIFICATION_FIXTURE');assert(p);const raw=shell('dumpsys notification');const lines=raw.split('\n');const fixtureRecords=lines.flatMap((line,i)=>line.includes('NotificationRecord(')&&line.includes('pkg=dev.olea.m2.fixture')?lines.slice(i,i+16):[]).join('\n');assert(fixtureRecords.includes('id=42'));return {before,after,dispatchedAt,independentFixtureRecord:fixtureRecords,postingPackageUid:10217,listenerPackageUid:10216};});
 await check('url-browser-destination',async()=>{const url='https://example.org/?olea=m3-url-a01';const result=await action('open_url',{url});assert.equal(result.body.ok,true);await wait(5000);const foreground=shell('dumpsys activity activities').split('\n').filter(l=>/topResumedActivity|mResumedActivity/.test(l)).join('\n');shell('uiautomator dump /data/local/tmp/olea-m3-url-a01.xml');const xml=device(['exec-out','cat','/data/local/tmp/olea-m3-url-a01.xml']);writeFileSync('spike/m3/runtime/evidence/url-a01-ui.xml',xml,{flag:'wx'});assert(foreground.includes('com.android.chrome'));assert(xml.includes('Example Domain'),'Browser content lacks expected Example Domain');assert(xml.includes('example.org'),'Browser address lacks supplied host');return {url,foreground,oracle:'url-a01-ui.xml',arrivalAt:Date.now()};});
} finally {report.endedAt=Date.now();writeFileSync('spike/m3/runtime/evidence/direct-categories-a01.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report.cases));}
