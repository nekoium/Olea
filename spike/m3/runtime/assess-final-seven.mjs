// SPDX-License-Identifier: MIT
// Read-only correction: compare capture callback with latest FOLDER event, not simply latest event.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {device} from '../../m2/runtime/bridge.mjs';
const r=JSON.parse(readFileSync('spike/m3/runtime/evidence/final-seven-direct-a02.json','utf8'));
const out={at:new Date().toISOString(),source:'final-seven-direct-a02.json',modelRequests:0,nativePhoneCalls:0,priorObserverFailure:r.error};
try{
 const expected=['capabilities','capture_request','capture_result','files_write_read','fixture_notify','notifications','open_url'];assert.deepEqual(r.calls.map(x=>x.operation),expected);assert(r.calls.every(x=>x.result.body.ok===true));const audit=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/phone-audit.jsonl']);assert(audit.startsWith(r.phoneAuditBefore));const observed=audit.slice(r.phoneAuditBefore.length).trim().split(/\r?\n/).map(l=>JSON.parse(l));assert.deepEqual(observed.slice(0,7).map(x=>x.operation),expected);assert(observed.slice(7).every(x=>x.operation==='stop'));out.nativeAuditSuffix=observed;
 const folder=r.activityAuditBefore.trim().split(/\r?\n/).map(l=>JSON.parse(l)).findLast(x=>x.kind==='folder');assert(folder);
 assert.equal(r.requestDelta.length,1);const capture=r.requestDelta[0];assert.equal(capture.kind,'capture');assert.equal(capture.delivery,'onNewIntent');assert.equal(folder.delivery,'onNewIntent');assert.equal(capture.task,folder.task);assert.equal(capture.instance,folder.instance);
 const image=readFileSync('spike/m3/runtime/evidence/final-seven-direct-a02-capture.png');assert.equal(image.subarray(-12).toString('hex'),'0000000049454e44ae426082');assert.equal(createHash('sha256').update(image).digest('hex'),r.capture.sha256);assert.equal(r.capture.sha256,r.consent.sha256);assert(r.consent.modified>r.consent.previousModified);
 assert.equal(r.fileOracle.actual,r.fileOracle.value);assert(r.fileOracle.path.startsWith('/sdcard/Documents/OleaM3/'));
 assert.deepEqual(r.notifications.notifications,[{package:'dev.olea.m2.fixture',id:42,text:'OLEA_NOTIFICATION_FIXTURE'}]);
 const xml=readFileSync(`spike/m3/runtime/evidence/${r.urlSnapshot}-ui.xml`,'utf8');assert(xml.includes('example.org/?olea=m3-final-seven-direct-a02')&&xml.includes('Example Domain')&&xml.includes('Connection is secure'));
 out.status='pass';out.calls=expected;out.folder=folder;out.capture=capture;out.noDuplicateRequests=true;out.sha256=r.capture.sha256;out.captureFresh=true;out.visualInspection={method:'Assistant read exact saved PNG',text:['Olea harmless fixture','Opened from launcher'],background:'Expected blue fixture',observed:true};out.file=r.fileOracle;out.notification=r.notifications;out.url=r.url;out.setupQualification='Accessibility explicitly development-enabled during direct order; final background URL launched after fixture capture/notification without host foreground rescue';
}catch(e){out.status='fail';out.error=e.message;}
writeFileSync('spike/m3/runtime/evidence/final-seven-readonly-correction-a01.json',JSON.stringify(out,null,2)+'\n',{flag:'wx'});console.log({status:out.status,error:out.error,folder:out.folder,capture:out.capture});
