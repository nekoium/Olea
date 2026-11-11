// SPDX-License-Identifier: MIT
// Authorized development UI traversal; every snapshot/action retained, never silent consent grants.
import {device} from '../../m2/runtime/bridge.mjs';
import {writeFileSync,readFileSync,existsSync} from 'node:fs';
const [attempt,action,...args]=process.argv.slice(2);
if(!/^[a-z0-9-]+$/.test(attempt??''))throw Error('attempt_required');
const out=`spike/m3/runtime/evidence/${attempt}`;
const log=existsSync(out+'-actions.json')?JSON.parse(readFileSync(out+'-actions.json','utf8')):[];
if(action==='snapshot'){
 device(['shell',`uiautomator dump /data/local/tmp/${attempt}.xml`]);
 const xml=device(['exec-out','cat',`/data/local/tmp/${attempt}.xml`]);
 writeFileSync(out+'-ui.xml',xml,{flag:'wx'});
 console.log(xml.replace(/></g,'>\n<').split('\n').filter(l=>/text="[^"]+"|content-desc="[^"]+"/.test(l)).join('\n'));
}else if(action==='tap'){
 const [snapshot,selector]=args;const xml=readFileSync(`spike/m3/runtime/evidence/${snapshot}-ui.xml`,'utf8');
 const nodes=xml.match(/<node\b[^>]*>/g)??[];
 const matches=nodes.filter(n=>n.includes(`text="${selector}"`)||n.includes(`content-desc="${selector}"`)||n.includes(`resource-id="${selector}"`));
 if(matches.length!==1)throw Error(`selector_count_${matches.length}`);
 const m=matches[0].match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);if(!m)throw Error('bounds_absent');
 const x=Math.floor((+m[1]+ +m[3])/2),y=Math.floor((+m[2]+ +m[4])/2);
 const result=device(['shell','input','tap',String(x),String(y)]);log.push({at:new Date().toISOString(),route:'Agent-operated visible user-grantable system/app UI via development ADB',snapshot,selector,x,y,result});writeFileSync(out+'-actions.json',JSON.stringify(log,null,2)+'\n');console.log({selector,x,y});
}else throw Error('invalid_action');
