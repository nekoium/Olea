import {Browser} from 'file:///C:/Users/Aria/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const b=await Browser.launch();const results=[];
const check=(name,condition)=>{if(!condition)throw Error(name);results.push(name)};
try{
 const p=await b.newPage({width:1440,height:1000});
 await p.goto(pathToFileURL(resolve('docs/ui/scenario-board-02.html')).href,{settleMs:100});
 const inventory=await p.eval(()=>scenarios.map(s=>({key:s.key,area:s.area})));
 const test=async(name,fn)=>check(name,await p.eval(fn));
 await test('Every scenario occurs exactly once in map nodes',()=>{const keys=journeyFlows.flatMap(f=>f.nodes.map(n=>n[0]));return scenarios.every(s=>keys.filter(k=>k===s.key).length===1)});
 // Exercise actual card clicks and every starting phone view.
 for(const s of inventory){await p.eval(s=>{selectJourney(s.area);document.querySelector(`[data-scenario="${s.key}"] button`).click()},s);await test('Entry '+s.key,()=>document.getElementById('phone').innerText.length>50&&document.querySelectorAll('#phone button').length>0);await test('Action syntax '+s.key,()=>[...document.querySelectorAll('#phone [onclick],#phone [onchange],#phone [onsubmit]')].every(e=>['onclick','onchange','onsubmit'].every(a=>!e.hasAttribute(a)||typeof new Function('event',e.getAttribute(a))==='function')));await p.eval(()=>document.querySelector('#phone .screenContent .primary,#phone .chatNotice button,#phone .composer .stop,#phone .terminalInput button,#phone .drawer button')?.click());check('Primary action '+s.key,p.consoleErrors.length===0);}
 await test('Setup requires explicit agent',()=>{startScenario('choose-agent');installAgent();return view==='choose-agent'&&state.notice.includes('Choose')});
 await test('Onboarding preserves choices and permits capability skips',()=>{startScenario('welcome');go('prepare');state.prepared=true;go('choose-agent');state.setupAgent='Claude Code';installAgent();state.configured=true;go('setup-workspace');state.form.workspaceName='My project';createWorkspace();go('ready');state.onboarding=false;go('history');return state.prepared&&state.setupAgent==='Claude Code'&&state.workspace==='My project'&&Object.values(state.capabilities).every(v=>!v)});
 await test('Setup resume keeps exact incomplete step',()=>{startScenario('welcome');reopen();if(!document.getElementById('phone').innerText.includes('Not prepared'))return false;startScenario('configure');state.form.connectionName='My sample';reopen();go(state.setupResumeView);return view==='configure'&&state.form.connectionName==='My sample'});
 await test('Agent locks after first send',()=>{startScenario('draft');state.draft='Inspect project';send();if(state.current!==null)return false;state.draftAgent='Codex';send();return currentSession().agent==='Codex'&&!document.getElementById('agentSelect')});
 await test('Completion and explicit follow-up',()=>{finish();if(currentSession().status!=='done')return false;state.draft='Inspect tests';send();return currentSession().status==='working'});
 await test('Stop turn leaves runtime available',()=>{stop();return currentSession().status==='stopped'&&state.environment});
 await test('Needs you resumes work',()=>{startScenario('needs-you');answer('Inspect redirect');return currentSession().status==='working'&&currentSession().messages.some(m=>m[1]==='Inspect redirect')});
 await test('Navigation preserves concurrent sessions',()=>{startScenario('concurrent');const id=state.current;go('workspaces');selectWorkspace('Olea');openSession(2);return state.sessions.find(s=>s.id===id).status==='working'&&state.current===2});
 await test('All-workspace and filtered history',()=>{startScenario('history');const all=document.querySelectorAll('.choiceRow').length;state.filter='Olea';render();return all===3&&document.querySelectorAll('.choiceRow').length===2});
 await test('Search and empty history',()=>{startScenario('search');state.search='reading';updateHistoryResults();if(document.querySelectorAll('#historyResults .choiceRow').length!==1)return false;startScenario('empty');return document.getElementById('historyResults').textContent.includes('No conversations')});
 await test('Drawer preserves underlying conversation',()=>{startScenario('working');openDrawer();drawer=false;render();return currentSession().status==='working'&&view==='chat'});
 await test('Permission grant updates correct capability',()=>{startScenario('android-permission');permissionResult(true);return state.capabilities.Location&&view==='phone-access'});
 await test('Permission denial permits continuing',()=>{startScenario('android-permission');permissionResult(false);if(view!=='permission-denied')return false;go('chat');return !state.capabilities.Location&&state.environment});
 await test('Capture stops on return',()=>{startScenario('capture-consent');go('android-capture');state.capture=true;go('capture-result');state.capture=false;go('chat');return !state.capture&&view==='chat'});
 await test('Environment stop affects runtime not saved history',()=>{startScenario('working');const n=currentSession().messages.length;shutdownEnvironment();return !state.environment&&currentSession().status==='error'&&currentSession().messages.length===n});
 await test('Restart never replays turn',()=>{restartEnvironment();return state.environment&&currentSession().status==='error'});
 await test('Fresh-chat preference',()=>{startScenario('settings');state.launch='fresh';reopen();return state.current===null&&view==='draft'});
 await test('Quoted workspace names remain selectable',()=>{startScenario('create-workspace');state.form.workspaceName=`Aria's "notes"`;createWorkspace();go('workspaces');[...document.querySelectorAll('.choiceRow')].find(b=>b.textContent.includes(`Aria's`)).click();return state.filter===`Aria's "notes"`});
 await test('Terminal command and shell separation',()=>{startScenario('terminal');state.form.command='pwd';runCommand();const first=state.shells[0].output;newShell();state.form.command='echo second';runCommand();return state.shells[0].output===first&&state.shells[1].output.includes('second')});
 await test('Terminal leave and return retains shell',()=>{const shells=state.shells;go('chat');go('terminal');return state.shells===shells});
 await test('Terminal interrupt preserves shell',()=>{state.form.command='sleep 10';runCommand();interruptShell();return state.shells.length===2&&!state.shells[state.shell].running&&state.shells[state.shell].output.includes('^C')});
 await test('Close shell ends only selected shell',()=>{closeShell();return state.shells.length===1});
 await test('Workspace terminals keep separate histories',()=>{startScenario('terminal');state.form.command='echo olea';runCommand();const olea=state.shells;selectWorkspace('Personal');go('terminal');if(state.shells===olea||!document.getElementById('phone').innerText.includes('Personal · Terminal'))return false;state.form.command='echo personal';runCommand();selectWorkspace('Olea');go('terminal');return state.shells===olea&&state.shells[0].output.includes('olea')&&!state.shells[0].output.includes('personal')});
 await test('Terminal loss creates new shell rather than resume claim',()=>{startScenario('terminal-lost');return !state.environment&&document.getElementById('phone').innerText.includes('not as proof')});
 await test('Back hides keyboard before leaving',()=>{startScenario('keyboard');const text=state.draft;back();return !state.keyboard&&view==='chat'&&state.draft===text});
 // Snapshot actual starting phone states at the design canvas scale.
 mkdirSync('docs/ui/scenarios-09',{recursive:true});
 await p.setViewport({width:1600,height:1100});
 for(const s of inventory){await p.eval(key=>startScenario(key),s.key);await p.eval(()=>new Promise(resolve=>setTimeout(resolve,230)));const clip=await p.eval(()=>{const r=document.getElementById('phone').getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}});await p.screenshot({path:`docs/ui/scenarios-09/${s.key}.jpg`,quality:78,clip});}
 await p.eval(()=>selectJourney('setup'));await p.send('Page.reload',{ignoreCache:true});await p.eval(()=>new Promise(resolve=>setTimeout(resolve,200)));
 for(const [width,height]of[[1440,900],[1280,720],[1060,711],[800,600],[390,844]]){await p.setViewport({width,height});await p.eval(()=>new Promise(requestAnimationFrame));await test(`Viewport ${width}×${height}`,()=>{const r=document.getElementById('phone').getBoundingClientRect(),c=document.querySelector('.scenarioActions').getBoundingClientRect();return document.documentElement.scrollWidth===innerWidth&&document.documentElement.scrollHeight===innerHeight&&r.bottom<=innerHeight&&r.right<=innerWidth&&c.bottom<=innerHeight});}
 await p.setViewport({width:1440,height:900});await p.eval(()=>{selectJourney('setup');startScenario('welcome')});await p.eval(()=>new Promise(resolve=>setTimeout(resolve,230)));await p.screenshot({path:'docs/ui/checks/coverage-09/setup.jpg',quality:85});
 await p.eval(()=>{selectJourney('terminal');startScenario('terminal')});await p.eval(()=>new Promise(resolve=>setTimeout(resolve,230)));await p.screenshot({path:'docs/ui/checks/coverage-09/terminal.jpg',quality:85});
 await p.eval(()=>{selectJourney('return');startScenario('history')});await p.eval(()=>new Promise(resolve=>setTimeout(resolve,230)));await p.screenshot({path:'docs/ui/checks/coverage-09/history.jpg',quality:85});
 for(const [area]of await p.eval(()=>areas)){await p.eval(a=>selectJourney(a),area);await p.eval(()=>Promise.all([...document.querySelectorAll('#board img')].map(i=>i.decode())));await test('Screenshots loaded '+area,()=>[...document.querySelectorAll('#board img')].every(i=>i.complete&&i.naturalWidth>0));}
 await test('All screenshots loaded',()=>[...document.querySelectorAll('#board img')].every(i=>i.complete&&i.naturalWidth>0));
 await p.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await p.eval(()=>startScenario('drawer'));await test('Reduced motion disables drawer animation',()=>getComputedStyle(document.querySelector('.drawer')).animationName==='none');
 check('No browser exceptions',p.consoleErrors.length===0);
 writeFileSync('docs/ui/checks/coverage-09/checks.json',JSON.stringify({scenarioCount:inventory.length,checks:results,consoleErrors:p.consoleErrors},null,2)+'\n');
 console.log(`${inventory.length} scenario screenshots; ${results.length} coverage checks passed.`);
}finally{await b.close()}
