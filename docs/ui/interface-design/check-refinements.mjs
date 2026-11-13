import {Browser} from 'file:///C:/Users/Aria/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const output=resolve('docs/ui/interface-design/checks/composer-refinements');
const temporary=resolve('docs/ui/interface-design/.tmp');
mkdirSync(output,{recursive:true});mkdirSync(temporary,{recursive:true});process.env.TASTE_SKILL_TMP=temporary;
const results=[];
const browser=await Browser.launch();
try{
 const p=await browser.newPage({width:1440,height:900});
 const check=async(name,fn)=>{if(!await p.eval(fn))throw Error(name);results.push(name)};
 const settle=()=>p.eval(()=>new Promise(r=>setTimeout(r,320)));
 await p.goto(pathToFileURL(resolve('docs/ui/scenario-board-02.html')).href,{settleMs:320});
 await check('Bottom Back removed; gesture bar centered',()=>{const phone=document.getElementById('phone').getBoundingClientRect(),bar=document.querySelector('.phoneBack .handle').getBoundingClientRect();return !document.querySelector('.phoneBack button')&&Math.abs((phone.left+phone.right-bar.left-bar.right)/2)<1});
 await p.eval(()=>startScenario('draft'));await settle();
 await check('New-session controls share anchored popup',()=>{const popup=document.querySelector('.sessionSetup'),dock=document.querySelector('.composerDock'),box=document.querySelector('.composer');const a=popup.getBoundingClientRect(),b=box.getBoundingClientRect();return popup.parentElement===dock&&popup.contains(document.getElementById('agentSelect'))&&getComputedStyle(popup).position==='absolute'&&a.bottom<b.top&&b.top-a.bottom<12});
 await check('Invalid send preserves setup and draft',()=>{state.draft='Inspect project';send();return state.current===null&&document.querySelector('.sessionSetup:not(.leaving)')&&state.draft==='Inspect project'});
 await check('Unavailable environment preserves setup',()=>{state.environment=false;state.draftAgent='Codex';send();const kept=state.current===null&&!!document.getElementById('agentSelect');state.environment=true;return kept});
 await check('Accepted first send animates setup out and fixes agent',()=>{state.draftAgent='Codex';send();const exit=document.querySelector('.sessionSetup.leaving');return currentSession().agent==='Codex'&&view==='chat'&&!document.getElementById('agentSelect')&&exit?.inert&&getComputedStyle(exit).animationName==='setupLeave'});
 await settle();
 await check('Setup exit completes and removes popup',()=>!document.querySelector('.sessionSetup'));
 await check('Follow-up stays in same session',()=>{const id=state.current;finish();state.draft='Inspect tests';send();return state.current===id&&currentSession().agent==='Codex'&&currentSession().status==='working'&&!document.querySelector('.sessionSetup')});
 await check('Stop still interrupts only the turn',()=>{document.querySelector('.stop').click();return currentSession().status==='stopped'&&state.environment});
 await check('Provider replaces keyboard toggle and opens popup',()=>{startScenario('draft');document.getElementById('providerToggle').click();return state.providerMenu&&document.getElementById('providerMenu')&&document.getElementById('providerToggle').getAttribute('aria-expanded')==='true'&&!document.querySelector('.composeactions').innerText.includes('Keyboard')});
 await check('Provider selection preserves draft and fixed agent',()=>{state.draft='Preserve this draft';state.connections.push('Second sample');render();[...document.querySelectorAll('.providerChoice')].find(e=>e.textContent.includes('Second sample')).click();state.draftAgent='Pi';send();return currentSession().provider==='Second sample'&&currentSession().agent==='Pi'&&currentSession().messages[0][1]==='Preserve this draft'&&!state.providerMenu});
 await check('Escape closes provider popup without leaving',()=>{document.getElementById('providerToggle').click();document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return !state.providerMenu&&view==='chat'});
 await check('Outside click dismisses provider popup',()=>{document.getElementById('providerToggle').click();document.querySelector('.apphead').click();return !state.providerMenu&&!document.getElementById('providerMenu')&&document.getElementById('providerToggle').getAttribute('aria-expanded')==='false'});
 await check('Provider menu opens management',()=>{document.getElementById('providerToggle').click();document.querySelector('.manageProviders').click();return view==='providers'&&!state.providerMenu});
 await check('Input focus opens keyboard fixture without a composer keyboard toggle',()=>{startScenario('draft');document.getElementById('messageInput').focus();return state.keyboard&&document.querySelector('.keyboard')&&document.activeElement.id==='messageInput'});
 await check('Back dismisses keyboard and preserves draft',()=>{state.draft='Keep typing';back();return !state.keyboard&&view==='draft'&&state.draft==='Keep typing'});
 await check('Slower entrance durations',()=>{startScenario('drawer');const drawerDuration=getComputedStyle(document.querySelector('.drawer')).animationDuration;drawer=false;sheet='details';render();return drawerDuration==='0.26s'&&getComputedStyle(document.querySelector('.sheet')).animationDuration==='0.28s'});
 await p.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await check('Reduced motion skips setup exit and drawer animation',()=>{startScenario('draft');state.draftAgent='Pi';state.draft='Inspect';send();if(document.querySelector('.sessionSetup'))return false;startScenario('drawer');return getComputedStyle(document.querySelector('.drawer')).animationName==='none'});
 await p.send('Emulation.setEmulatedMedia',{features:[]});
 const inventory=await p.eval(()=>scenarios.map(s=>({key:s.key,area:s.area})));
 await check('All 61 scenarios remain mapped once',()=>{const keys=journeyFlows.flatMap(f=>f.nodes.map(n=>n[0]));return scenarios.length===61&&scenarios.every(s=>keys.filter(k=>k===s.key).length===1)});
 for(const s of inventory){
  await p.eval(s=>{selectJourney(s.area);document.querySelector(`[data-scenario="${s.key}"] button`).click()},s);
  await check('Scenario entry and handlers: '+s.key,()=>document.getElementById('phone').innerText.length>50&&[...document.querySelectorAll('#phone [onclick],#phone [onchange],#phone [onsubmit]')].every(e=>['onclick','onchange','onsubmit'].every(a=>!e.hasAttribute(a)||typeof new Function('event',e.getAttribute(a))==='function')));
 }
 for(const [width,height]of[[1440,900],[1280,720],[1060,711],[800,600],[390,844]]){
  await p.setViewport({width,height});
  await p.eval(()=>{startScenario('draft');return new Promise(requestAnimationFrame)});
  await check(`Viewport and setup popup ${width}x${height}`,()=>{const phone=document.getElementById('phone').getBoundingClientRect(),popup=document.querySelector('.sessionSetup').getBoundingClientRect(),controls=document.querySelector('.scenarioActions').getBoundingClientRect();return document.documentElement.scrollWidth===innerWidth&&document.documentElement.scrollHeight===innerHeight&&phone.bottom<=innerHeight&&phone.right<=innerWidth&&controls.bottom<=innerHeight&&popup.top>=phone.top&&popup.left>=phone.left&&popup.right<=phone.right&&[...document.querySelectorAll('.scenarioTile')].every(e=>e.getBoundingClientRect().width>=74)});
 }
 await p.setViewport({width:1440,height:900});
 for(const key of ['draft','environment-stop','keyboard']){await p.eval(key=>startScenario(key),key);await settle();await p.screenshot({path:resolve(output,key+'.jpg'),quality:85})}
 await p.eval(()=>{startScenario('draft');document.getElementById('providerToggle').click()});await settle();await p.screenshot({path:resolve(output,'provider-popup.jpg'),quality:85});
 await p.setViewport({width:1600,height:1100});
 for(const s of inventory){await p.eval(key=>startScenario(key),s.key);await settle();const clip=await p.eval(()=>{const r=document.getElementById('phone').getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}});await p.screenshot({path:resolve('docs/ui/scenarios-09',s.key+'.jpg'),quality:78,clip})}
 results.push('Refreshed all 61 scenario card screenshots');
 for(const [area]of await p.eval(()=>areas)){await p.eval(area=>selectJourney(area),area);await p.eval(()=>Promise.all([...document.querySelectorAll('#board img')].map(i=>i.decode())))}
 if(p.consoleErrors.length)throw Error(JSON.stringify(p.consoleErrors));results.push('No browser exceptions');
 writeFileSync(resolve(output,'checks.json'),JSON.stringify({checks:results,consoleErrors:p.consoleErrors},null,2)+'\n');
 console.log(`${results.length} checks passed; 61 scenario screenshots refreshed.`);
}finally{await browser.close()}
