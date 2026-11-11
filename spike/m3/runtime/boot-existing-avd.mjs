// SPDX-License-Identifier: MIT
// Explicitly authorized existing-AVD startup; no wipe, snapshot reset or configuration edits.
import {spawn,execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,openSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sdk='C:/Users/Aria/AppData/Local/Android/Sdk';
const config='C:/Users/Aria/.android/avd/Olea_API_36.avd/config.ini';
const hash=()=>createHash('sha256').update(readFileSync(config)).digest('hex');
const env={};for(const k of ['PATH','SystemRoot','SYSTEMROOT','WINDIR','TEMP','TMP','USERPROFILE','LOCALAPPDATA','APPDATA'])if(process.env[k])env[k]=process.env[k];
const report={attempt:'boot-m3-a01',startedAt:new Date().toISOString(),configBefore:hash(),args:['-avd','Olea_API_36','-no-snapshot','-gpu','swiftshader','-no-audio'],priorObservation:'No ADB devices or matching Windows emulator/qemu process; cause/time of shutdown unknown',modelRequests:0};
report.devicesBefore=execFileSync(`${sdk}/platform-tools/adb.exe`,['devices','-l'],{encoding:'utf8',timeout:10000});
if(report.devicesBefore.includes('emulator-5554'))throw Error('intended_serial_already_present');
const child=spawn(`${sdk}/emulator/emulator.exe`,report.args,{env,stdio:['ignore',openSync('.setup/boot-m3-a01.stdout.log','wx'),openSync('.setup/boot-m3-a01.stderr.log','wx')],detached:true,windowsHide:false});
report.launchPid=child.pid;child.unref();
const deadline=Date.now()+120000;let done=false;
const timer=setInterval(()=>{
 try{
  const result=execFileSync(`${sdk}/platform-tools/adb.exe`,['-s','emulator-5554','shell','getprop sys.boot_completed; getprop ro.boot.qemu.avd_name; getprop ro.build.version.sdk; getprop ro.product.cpu.abi'],{encoding:'utf8',timeout:5000,stdio:['ignore','pipe','ignore']});
  if(result.trim().startsWith('1')&&result.includes('Olea_API_36')){report.identity=result;report.status='booted';done=true;}
 }catch{}
 if(done||Date.now()>=deadline){clearInterval(timer);report.status??='boot_unverified_at_120s';report.endedAt=new Date().toISOString();report.configAfter=hash();writeFileSync('spike/m3/runtime/evidence/boot-m3-a01.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
},2000);
