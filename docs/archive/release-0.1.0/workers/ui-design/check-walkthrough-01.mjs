import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { Browser } from 'file:///C:/Users/Aria/.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';

const out=resolve('docs/ui/checks/daily-use-01');
mkdirSync(out,{recursive:true});
mkdirSync(resolve('docs/ui/checks/browser-temp'),{recursive:true});
process.env.TASTE_SKILL_TMP=resolve('docs/ui/checks/browser-temp');
const browser=await Browser.launch();
const results=[];
try {
 const page=await browser.newPage({width:1440,height:1000});
 await page.goto(pathToFileURL(resolve('docs/ui/daily-use-walkthrough-01.html')).href,{settleMs:50});
 const check=async (name,fn)=>{assert.equal(await page.eval(fn),true,name);results.push(name)};
 await check('Resume has fixed agent identity and no agent selector',()=>!!document.querySelector('.apphead small')&&!document.querySelector('#agentSelect'));
 await page.eval(()=>document.querySelector('[aria-label="New conversation"]').click());
 await check('Setup appears outside composer before first send',()=>!!document.querySelector('#agentSelect')&&!document.querySelector('.composer select')&&!!(document.querySelector('.setup').compareDocumentPosition(document.querySelector('.composer'))&Node.DOCUMENT_POSITION_FOLLOWING));
 await page.eval(()=>{const a=document.querySelector('#agentSelect');a.value='Codex';a.dispatchEvent(new Event('change'));const t=document.querySelector('#messageInput');t.value='Read project notes and summarize open tasks.';t.dispatchEvent(new Event('input'))});
 await page.screenshot({path:resolve(out,'desktop-draft.jpg')});
 await page.eval(()=>document.querySelector('.composer').requestSubmit());
 await check('First send fixes selected agent and presents STOP',()=>document.querySelector('.apphead small').textContent==='Codex'&&!document.querySelector('#agentSelect')&&!!document.querySelector('.stop'));
 await page.eval(()=>document.querySelector('.tools summary').click());
 await check('Tool result expands',()=>document.querySelector('.tools').open);
 await page.eval(()=>document.querySelector('.stop').click());
 await check('STOP retains transcript and removes running control',()=>!document.querySelector('.stop')&&document.querySelector('.messages').textContent.includes('Stopped.'));
 await page.eval(()=>document.querySelector('[aria-label="Olea destinations"] button:last-child').click());
 await page.eval(()=>[...document.querySelectorAll('.row')].find(e=>e.textContent.startsWith('Personal')).click());
 await check('Workspace selects filtered Conversations',()=>document.querySelector('.filter').textContent.includes('Personal')&&[...document.querySelectorAll('.conversationRow')].some(e=>e.textContent.includes('Codex')));
 await page.eval(()=>document.querySelector('.conversationRow:last-child').click());
 await check('History reopens the same agent and stopped transcript',()=>document.querySelector('.apphead small').textContent==='Codex'&&document.querySelector('.messages').textContent.includes('Stopped.'));
 await page.eval(()=>{draft='Continue reading.';send();fail()});
 await check('Connection loss does not replay or clear history',()=>!!document.querySelector('.error')&&!document.querySelector('.stop')&&document.querySelector('.messages').textContent.includes('Stopped.'));
 await page.eval(()=>{draft='Continue.';send();finish()});
 await check('Completion returns to an editable conversation',()=>!document.querySelector('.stop')&&!!document.querySelector('#messageInput'));
 await page.eval(()=>{launch='fresh';reopen()});
 await check('Fresh-chat preference shows first-turn selectors',()=>!!document.querySelector('#agentSelect'));
 for(const width of [1440,768,390]){
  await page.setViewport({width,height:width===390?1000:1000});
  await page.eval(()=>{resetStudy();newChat()});
  await check(`No page or phone horizontal overflow at ${width}px`,()=>document.documentElement.scrollWidth<=innerWidth&&document.querySelector('.phone').scrollWidth<=document.querySelector('.phone').clientWidth);
  await page.screenshot({path:resolve(out,`draft-${width}.jpg`)});
  await page.eval(()=>{draft='Read my project notes.';send()});
  await check(`STOP stays inside phone at ${width}px`,()=>{const p=document.querySelector('.phone').getBoundingClientRect(),s=document.querySelector('.stop').getBoundingClientRect();return s.top>=p.top&&s.bottom<=p.bottom});
  await page.screenshot({path:resolve(out,`working-${width}.jpg`)});
  await page.eval(()=>mode('board'));
  await check(`Overview does not overflow at ${width}px`,()=>document.documentElement.scrollWidth<=innerWidth);
  if(width===1440)await page.screenshot({path:resolve(out,'overview-desktop.jpg'),fullPage:true});
  await page.eval(()=>mode('walk'));
 }
 assert.deepEqual(page.consoleErrors,[]);
 results.push('No browser JavaScript exceptions');
 writeFileSync(resolve(out,'checks.json'),JSON.stringify({results},null,2)+'\n');
 console.log(`${results.length} browser checks passed. Screenshots: docs/ui/checks/daily-use-01/`);
} finally {await browser.close()}
