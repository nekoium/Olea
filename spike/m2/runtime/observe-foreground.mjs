// Original MIT. Host-only independent foreground observation, finite samples, no phone effects.
import { appendFileSync, writeFileSync } from 'node:fs';
import { device } from './bridge.mjs';
const output=process.argv[2];
if(!output?.startsWith('.setup/'))throw Error('task_local_output_required');
writeFileSync(output,'');
const started=Date.now();let previous='',samples=0;
while(Date.now()-started<150000&&samples++<600){
  let detail;
  try{detail=device(['shell','dumpsys','activity','activities']).split('\n').filter(l=>/topResumedActivity|mResumedActivity/.test(l)).join('\n').trim();}catch{detail='observation_failed';}
  if(detail!==previous){appendFileSync(output,JSON.stringify({atMs:Date.now(),detail})+'\n');previous=detail;}
  await new Promise(r=>setTimeout(r,200));
}
appendFileSync(output,JSON.stringify({endedAtMs:Date.now(),samples,bounded:true})+'\n');
