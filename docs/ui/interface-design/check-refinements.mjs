import {Browser} from 'file:///C:/Users/Aria/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const output=resolve('docs/ui/interface-design/checks/gentle-theme');
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
 await check('New-session controls join the composer edge-to-edge',()=>{const popup=document.querySelector('.sessionSetup'),dock=document.querySelector('.composerDock'),box=document.querySelector('.composer');const a=popup.getBoundingClientRect(),b=box.getBoundingClientRect();return popup.parentElement===dock&&popup.contains(document.getElementById('agentSelect'))&&getComputedStyle(popup).position==='absolute'&&Math.abs(a.bottom-b.top)<=1&&getComputedStyle(popup).borderBottomWidth==='0px'&&getComputedStyle(box).borderTopLeftRadius==='0px'});
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
 await check('Theme toggle preserves draft, selection and keyboard state',()=>{startScenario('draft');state.draft='Keep this draft';state.draftAgent='Codex';document.getElementById('messageInput').value=state.draft;document.getElementById('themeToggle').click();const kept=document.documentElement.dataset.theme==='dark'&&state.draft==='Keep this draft'&&state.draftAgent==='Codex'&&!state.keyboard&&document.getElementById('messageInput').value==='Keep this draft';setTheme('light');return kept});
 await check('Theme survives scenario changes and reopen',()=>{setTheme('dark');startScenario('settings');reopen();const kept=document.documentElement.dataset.theme==='dark';setTheme('light');return kept});
 await check('Styled radios preserve launch preference behavior',()=>{startScenario('settings');document.querySelector('input[name=launch][value=fresh]').click();const radio=document.querySelector('input[name=launch]:checked');return state.launch==='fresh'&&radio.value==='fresh'&&getComputedStyle(radio).appearance==='none'&&getComputedStyle(radio,'::before').transform==='matrix(1, 0, 0, 1, 0, 0)'});
 await check('Settings selects dark and light appearance',()=>{document.querySelector('input[name=appearance][value=dark]').click();const dark=document.documentElement.dataset.theme==='dark'&&document.querySelector('input[name=appearance][value=dark]').checked;document.querySelector('input[name=appearance][value=light]').click();return dark&&document.documentElement.dataset.theme==='light'&&state.launch==='fresh'});
 for(const theme of ['light','dark']){
  await p.eval(theme=>setTheme(theme),theme);
  await check('Readable primary and alert text in '+theme,()=>{const luminance=rgb=>{const c=rgb.match(/[\d.]+/g).slice(0,3).map(n=>{const v=Number(n)/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*c[0]+.7152*c[1]+.0722*c[2]};const contrast=e=>{const s=getComputedStyle(e),a=luminance(s.color),b=luminance(s.backgroundColor);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};startScenario('tool-error');if(contrast(document.querySelector('.errorBox'))<4.5||contrast(document.querySelector('.primary'))<4.5)return false;startScenario('needs-you');return contrast(document.querySelector('.chatNotice.needs'))>=4.5&&contrast(document.querySelector('.stateChip.needs'))>=4.5});
  await p.setViewport({width:1600,height:1100});
  const imageDirectory=resolve(theme==='dark'?'docs/ui/scenarios-dark-10':'docs/ui/scenarios-09');mkdirSync(imageDirectory,{recursive:true});
  for(const s of inventory){await p.eval(key=>startScenario(key),s.key);await settle();const clip=await p.eval(()=>{const r=document.getElementById('phone').getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}});await p.screenshot({path:resolve(imageDirectory,s.key+'.jpg'),quality:78,clip})}
  results.push('Refreshed all 61 scenario card screenshots in '+theme);
  for(const [area]of await p.eval(()=>areas)){await p.eval(area=>selectJourney(area),area);await p.eval(()=>Promise.all([...document.querySelectorAll('#board img')].map(i=>i.decode())))}
  await p.setViewport({width:1440,height:900});
  for(const key of ['draft','tool-error','needs-you','settings']){await p.eval(key=>{selectJourney(scenarios.find(s=>s.key===key).area);startScenario(key)},key);await p.eval(()=>Promise.all([...document.querySelectorAll('#board img')].map(i=>i.decode())));await settle();await p.screenshot({path:resolve(output,theme+'-'+key+'.jpg'),quality:85})}
  await p.eval(()=>{selectJourney('daily');startScenario('draft');document.getElementById('messageInput').focus()});await settle();
  await check('Connected setup stays inside phone with keyboard in '+theme,()=>{const popup=document.querySelector('.sessionSetup').getBoundingClientRect(),phone=document.getElementById('phone').getBoundingClientRect();return popup.top>=phone.top&&popup.bottom<phone.bottom&&!!document.querySelector('.keyboard')});
  await p.screenshot({path:resolve(output,theme+'-draft-keyboard.jpg'),quality:85});
 }
 if(p.consoleErrors.length)throw Error(JSON.stringify(p.consoleErrors));results.push('No browser exceptions');
 writeFileSync(resolve(output,'checks.json'),JSON.stringify({checks:results,consoleErrors:p.consoleErrors},null,2)+'\n');
 console.log(`${results.length} checks passed; 122 light/dark scenario screenshots refreshed.`);
}finally{await browser.close()}
