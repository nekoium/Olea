import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { Browser } from 'file:///C:/Users/Aria/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const images=resolve('docs/ui/scenarios-02');
const checks=resolve('docs/ui/checks/scenarios-02');
mkdirSync(images,{recursive:true});mkdirSync(checks,{recursive:true});
mkdirSync(resolve('docs/ui/checks/browser-temp'),{recursive:true});
process.env.TASTE_SKILL_TMP=resolve('docs/ui/checks/browser-temp');
const browser=await Browser.launch();const results=[];
try{
 const p=await browser.newPage({width:1440,height:1100});
 await p.goto(pathToFileURL(resolve('docs/ui/scenario-board-02.html')).href,{settleMs:50});
 assert.equal(await p.eval(()=>!document.querySelector('#board').hidden&&document.querySelector('#walk').hidden),true);results.push('Scenario board is the entry view');
 const keys=await p.eval(()=>scenarios.map(s=>s.key));
 for(const key of keys){
  await p.eval(key=>startScenario(key),key);
  const rect=await p.eval(()=>{const r=document.querySelector('#phone').getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}});
  const shot=await p.send('Page.captureScreenshot',{format:'jpeg',quality:85,captureBeyondViewport:true,clip:{...rect,scale:1}});
  writeFileSync(resolve(images,key+'.jpg'),Buffer.from(shot.data,'base64'));
  assert.equal(await p.eval(key=>activeScenario===key&&document.querySelector('#scenarioExpected').textContent.startsWith('Expected:')&&!document.querySelector('#walk').hidden,key),true);
  await p.eval(()=>{draft='A different task';newChat()});
  await p.eval(key=>startScenario(key),key);
  const expected={chat:'chat',draft:'draft',working:'working',stopped:'working',workspaces:'workspaces',history:'history',error:'error'}[key];
  assert.equal(await p.eval(()=>effective()),expected);results.push(`${key}: explicit instructions, screenshot and repeatable entry state`);
 }
 await p.eval(()=>startScenario('stopped'));
 await p.eval(()=>document.querySelector('.stop').click());assert.equal(await p.eval(()=>effective()),'stopped');results.push('Interrupt slice starts working and STOP reaches the expected state');
 await p.eval(()=>startScenario('workspaces'));
 await p.eval(()=>[...document.querySelectorAll('.row')].find(r=>r.textContent.startsWith('Olea')).click());
 assert.equal(await p.eval(()=>page==='history'&&filter==='Olea'),true);results.push('Workspace slice reaches filtered Conversations');
 await p.eval(()=>startScenario('history'));
 await p.eval(()=>{const s=document.querySelector('.search');s.value='notes';s.dispatchEvent(new Event('input'));document.querySelector('.conversationRow:not([hidden])').click()});
 assert.equal(await p.eval(()=>page==='chat'&&currentSession().agent==='Pi'),true);results.push('History slice search and reopening reach the expected Pi session');
 await p.goto(pathToFileURL(resolve('docs/ui/scenario-board-02.html')).href,{settleMs:50});
 for(const width of [1440,768,390]){
  await p.setViewport({width,height:1000});await p.eval(()=>mode('board'));
  await p.eval(()=>Promise.all([...document.images].map(i=>i.decode())));
  assert.equal(await p.eval(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await p.screenshot({path:resolve(checks,`board-${width}.jpg`),fullPage:true});
  await p.eval(()=>startScenario('draft'));
  assert.equal(await p.eval(()=>document.documentElement.scrollWidth<=innerWidth&&!document.querySelector('.scenarioBrief').hidden),true);
  await p.screenshot({path:resolve(checks,`scenario-${width}.jpg`)});
  results.push(`Board screenshots load and scenario instructions fit at ${width}px`);
 }
 assert.deepEqual(p.consoleErrors,[]);results.push('No browser exceptions');
 writeFileSync(resolve(checks,'checks.json'),JSON.stringify({results},null,2)+'\n');
 console.log(`${results.length} scenario checks passed; seven actual prototype screenshots saved.`);
}finally{await browser.close()}
