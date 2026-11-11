// SPDX-License-Identifier: MIT
// Authorized development setup for bounded deterministic recovery, never ordinary consent evidence.
import {device,nativeRequest} from '../../m2/runtime/bridge.mjs';
import {writeFileSync} from 'node:fs';
const report={at:new Date().toISOString(),scope:'Development native enable and Accessibility setup authorized by task_d0b3c88ea259',modelRequests:0};
report.accessibilityBefore=device(['shell','settings get secure enabled_accessibility_services']).trim();
report.accessibilityEnabledBefore=device(['shell','settings get secure accessibility_enabled']).trim();
report.captureBefore=device(['shell',"run-as dev.olea.m2.runtime sh -c 'if [ -e files/capture.png ]; then echo PRESENT; else echo ABSENT; fi'"]).trim();
if(report.captureBefore!=='ABSENT')throw Error('Preserve capture oracle before disruption');
report.flag=device(['shell',"run-as dev.olea.m2.runtime sh -c 'touch files/enable-phone-once'"]);
report.appStop=device(['shell','am force-stop dev.olea.m2.runtime']);
const component='dev.olea.m2.runtime/dev.olea.spike.PhoneAccessibility';
const previous=report.accessibilityBefore==='null'?'':report.accessibilityBefore;
const entries=[...new Set([...previous.split(':').filter(Boolean),component])].join(':');
report.developmentAccessibility=device(['shell',`settings put secure enabled_accessibility_services ${entries}; settings put secure accessibility_enabled 1`]);
report.explicitLaunch=device(['shell','am start -f 0x18000000 -n dev.olea.m2.runtime/dev.olea.spike.MainActivity']);
const deadline=Date.now()+5000;
while(Date.now()<deadline){await new Promise(r=>setTimeout(r,200));try{report.capabilities=await nativeRequest('/capabilities');if(report.capabilities.body.result?.phoneEnabled&&report.capabilities.body.result.accessibility)break;}catch{}}
writeFileSync('spike/m3/runtime/evidence/active-recovery-development-setup-a01.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(report.capabilities);
