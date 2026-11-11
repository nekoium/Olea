// SPDX-License-Identifier: MIT
// Stock Pi seven-tool readiness only; no authorized secret read, inference or phone action.
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {Backend} from '../../backend/dist/backend.js';
const root='/workspace/m3-final-seven-registration-a01';await mkdir(root);await mkdir(root+'/workspace');
const names=['phone_capabilities','phone_capture_request','phone_capture_result','phone_files_write_read','phone_fixture_notify','phone_notifications','phone_open_url'];
await writeFile(root+'/synthetic.json',JSON.stringify({baseUrl:'https://api.chiyi.cc/v1',apiKey:'synthetic-noncredential-readiness-only'}),{mode:0o600});
const env={PATH:process.env.PATH,HOME:process.env.HOME,OLEA_PROVIDER_CONFIG:root+'/synthetic.json',OLEA_MODEL:'gpt-6.1-terra',OLEA_BRIDGE_CONFIG:'/run/olea-bridge.json',OLEA_PHONE_CALL_LIMIT:'7',OLEA_PHONE_TOOL_ALLOWLIST:names.join(','),OLEA_PHONE_READINESS:root+'/readiness.json',OLEA_PHONE_CAPTURE_READY:root+'/capture-ready.json'};
const report={modelRequests:0,phoneCalls:0,expected:names,provider:'Synthetic noncredential; startup/get_state only'};
const backend=new Backend({entry:'/opt/agents/pi/node_modules/@earendil-works/pi-coding-agent/dist/cli.js',workspace:root+'/workspace',stateDir:root+'/state',env},()=>{});
try{report.start=await backend.start('readiness');report.readiness=JSON.parse(await readFile(root+'/readiness.json','utf8'));if(report.readiness.maxNativeCalls!==7||report.readiness.active.length!==7||names.some(name=>!report.readiness.active.includes(name)))throw Error('seven_tool_registration_failed');report.version=JSON.parse(await readFile('/opt/agents/pi/node_modules/@earendil-works/pi-coding-agent/package.json','utf8')).version;report.status='pass';}catch(e){report.status='fail';report.error=e.message;}finally{await backend.close();await writeFile(root+'/report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,error:report.error,readiness:report.readiness}));}
