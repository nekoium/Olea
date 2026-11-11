// SPDX-License-Identifier: MIT
// Existing M3 visible consent recipe, scoped to immutable new M5 evidence.
import {device} from '../../m2/runtime/bridge.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
const [attempt,action,...args]=process.argv.slice(2);
if(!/^[a-z0-9-]+$/.test(attempt??''))throw Error('attempt_required');
const root='spike/m5/runtime/evidence/';
if(action==='snapshot'){
 device(['shell',`uiautomator dump /data/local/tmp/${attempt}.xml`]);
 const xml=device(['exec-out','cat',`/data/local/tmp/${attempt}.xml`]);writeFileSync(root+attempt+'-ui.xml',xml,{flag:'wx'});
 console.log(xml.replace(/></g,'>\n<').split('\n').filter(l=>/text="[^"]+"|content-desc="[^"]+"/.test(l)).join('\n'));
}else if(action==='tap'){
 const [snapshot,selector]=args;const xml=readFileSync(root+snapshot+'-ui.xml','utf8');const matches=(xml.match(/<node\b[^>]*>/g)??[]).filter(n=>n.includes(`text="${selector}"`)||n.includes(`content-desc="${selector}"`)||n.includes(`resource-id="${selector}"`));
 if(matches.length!==1)throw Error(`selector_count_${matches.length}`);const m=matches[0].match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);if(!m)throw Error('bounds_absent');
 const x=Math.floor((+m[1]+ +m[3])/2),y=Math.floor((+m[2]+ +m[4])/2);const result=device(['shell','input','tap',String(x),String(y)]);
 writeFileSync(root+attempt+'-action.json',JSON.stringify({at:new Date().toISOString(),route:'Agent-operated actual visible app/system UI through development ADB; not silent grant',snapshot,selector,x,y,result},null,2)+'\n',{flag:'wx'});console.log({selector,x,y});
}else throw Error('invalid_action');
