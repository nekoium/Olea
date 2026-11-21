(() => {
'use strict';
const data=window.OLEA_CAPTURE_SET,viewport=document.getElementById('viewport'),world=document.getElementById('world'),links=document.getElementById('links');
const key='olea-issue11-emulator-canvas-v1', cards=[], groups=[], byId=new Map();
let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
let scale=.6,panX=40,panY=40,drag=null,active=null,space=false;
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n};
function persist(){try{localStorage.setItem(key,JSON.stringify({positions:Object.fromEntries(cards.map(c=>[c.id,{x:c.x,y:c.y}])),notes:Object.fromEntries(cards.filter(c=>c.note).map(c=>[c.id,c.note]))}))}catch{document.getElementById('count').textContent='Storage full · export notes to keep them'}}
function transform(){world.style.transform=`translate(${panX}px,${panY}px) scale(${scale})`;document.getElementById('zoom').textContent=Math.round(scale*100)+'%';viewport.style.backgroundPosition=`${panX}px ${panY}px`;viewport.style.backgroundSize=`${22*scale}px ${22*scale}px`}
function drawLinks(){links.querySelectorAll(':scope > path').forEach(p=>p.remove());for(const [from,to] of data.edges){const a=byId.get(from),b=byId.get(to);if(!a||!b)continue;const x1=a.x+260+2000,y1=a.y+315+2000,x2=b.x+2000,y2=b.y+315+2000;const p=document.createElementNS('http://www.w3.org/2000/svg','path');const bend=Math.max(24,Math.abs(x2-x1)*.4);p.setAttribute('d',`M${x1} ${y1} C${x1+bend} ${y1} ${x2-bend} ${y2} ${x2} ${y2}`);links.append(p)}}
function place(card){card.node.style.left=card.x+'px';card.node.style.top=card.y+'px'}
for(const [row,group] of data.groups.entries()){
 const y=60+row*860;groups.push({...group,y});
 const label=el('section','group-label');label.style.left='70px';label.style.top=y+'px';label.append(el('h2','',group.title),el('p','',group.note));world.append(label);
 const button=el('button','',group.title.slice(5));button.dataset.group=group.id;button.append(el('span','group-count',String(group.screens.length)));button.onclick=()=>focusGroup(group.id);document.getElementById('groups').append(button);
 for(const [col,[id,title]] of group.screens.entries()){
  const defaultX=70+col*320,defaultY=y+88;const pos=saved.positions?.[id];
  const card={id,title,group:group.id,x:Number.isFinite(pos?.x)?pos.x:defaultX,y:Number.isFinite(pos?.y)?pos.y:defaultY,defaultX,defaultY,note:typeof saved.notes?.[id]==='string'?saved.notes[id]:''};
  const node=el('article','card');node.dataset.id=id;card.node=node;
  const head=el('div','card-head');head.append(el('span','',String(cards.length+1).padStart(2,'0')),el('h3','',title));const open=el('button','inspect','↗');open.setAttribute('aria-label','Inspect '+title);open.onclick=()=>inspect(card);head.append(open);
  const img=el('img');img.src=`captures/${id}.png`;img.alt=title+' — actual emulator capture';img.draggable=false;
  const foot=el('div','card-foot'+(card.note?' has-note':''));foot.append(el('span','','EMULATOR · 0.1.0'),el('span','note-mark',card.note?'NOTE':'1080 × 2400'));card.foot=foot;
  node.append(head,img,foot);node.ondblclick=()=>inspect(card);world.append(node);cards.push(card);byId.set(id,card);place(card);
 }
}
document.getElementById('count').textContent=cards.length+' captures · 6 journeys';
document.getElementById('build').textContent=data.build+' / '+data.device;
function zoomTo(value,x,y){const rect=viewport.getBoundingClientRect(),px=x-rect.left,py=y-rect.top;value=Math.min(3,Math.max(.08,value));panX=px-(px-panX)*value/scale;panY=py-(py-panY)*value/scale;scale=value;transform()}
function zoomCenter(factor){const r=viewport.getBoundingClientRect();zoomTo(scale*factor,r.left+r.width/2,r.top+r.height/2)}
function fit(items,topExtra=0){const minX=Math.min(...items.map(c=>c.x))-35,minY=Math.min(...items.map(c=>c.y))-topExtra-25,maxX=Math.max(...items.map(c=>c.x+260))+35,maxY=Math.max(...items.map(c=>c.y+663))+35;const r=viewport.getBoundingClientRect();scale=Math.min(1,(r.width-80)/(maxX-minX),(r.height-100)/(maxY-minY));scale=Math.max(.08,scale);panX=(r.width-(maxX-minX)*scale)/2-minX*scale;panY=35-minY*scale;transform()}
function focusGroup(id){document.querySelectorAll('nav button').forEach(n=>n.classList.toggle('active',n.dataset.group===id));fit(cards.filter(c=>c.group===id),90)}
function inspect(card){active=card;document.getElementById('inspect-title').textContent=card.title;document.getElementById('inspect-meta').textContent='Observed · '+data.build+' · 1080 × 2400';document.getElementById('inspect-image').src=`captures/${card.id}.png`;document.getElementById('inspect-image').alt=card.title;document.getElementById('original').href=`captures/${card.id}.png`;document.getElementById('note').value=card.note;document.getElementById('inspect-limit').textContent=card.group==='setup'?'Reached through real onboarding. Environment preparation failed.':'Setup gate bypassed in a fresh install for UI inspection. No agent execution validated.';document.getElementById('inspector').showModal()}
document.getElementById('note').oninput=event=>{if(!active)return;active.note=event.target.value;active.foot.classList.toggle('has-note',!!active.note);active.foot.querySelector('.note-mark').textContent=active.note?'NOTE':'1080 × 2400';persist()};
viewport.addEventListener('wheel',event=>{event.preventDefault();zoomTo(scale*Math.exp(-Math.max(-180,Math.min(180,event.deltaY))*.002),event.clientX,event.clientY)},{passive:false});
viewport.addEventListener('pointerdown',event=>{if(event.target.closest('button')||![0,1].includes(event.button))return;viewport.focus();event.preventDefault();const node=event.target.closest('.card'),card=node&&!space&&event.button===0?byId.get(node.dataset.id):null;drag={id:event.pointerId,x:event.clientX,y:event.clientY,panX,panY,card,cardX:card?.x,cardY:card?.y};viewport.setPointerCapture(event.pointerId);viewport.classList.add('dragging')});
viewport.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(drag.card){drag.card.x=drag.cardX+dx/scale;drag.card.y=drag.cardY+dy/scale;place(drag.card);drawLinks()}else{panX=drag.panX+dx;panY=drag.panY+dy;transform()}});
function finish(event){if(!drag||event.pointerId!==drag.id)return;if(drag.card)persist();drag=null;viewport.classList.remove('dragging')}
viewport.addEventListener('pointerup',finish);viewport.addEventListener('pointercancel',finish);
window.addEventListener('keydown',event=>{if(document.querySelector('dialog[open]')||['INPUT','TEXTAREA'].includes(event.target.tagName))return;if(event.code==='Space'){space=true;event.preventDefault()}if(event.key==='+'||event.key==='=')zoomCenter(1.2);if(event.key==='-')zoomCenter(1/1.2);const moves={ArrowLeft:[70,0],ArrowRight:[-70,0],ArrowUp:[0,70],ArrowDown:[0,-70]};if(moves[event.key]){event.preventDefault();panX+=moves[event.key][0];panY+=moves[event.key][1];transform()}});
window.addEventListener('keyup',event=>{if(event.code==='Space')space=false});window.addEventListener('blur',()=>{space=false;drag=null});
document.getElementById('in').onclick=()=>zoomCenter(1.25);document.getElementById('out').onclick=()=>zoomCenter(.8);document.getElementById('fit').onclick=()=>{fit(cards,90);document.querySelectorAll('nav button').forEach(n=>n.classList.remove('active'))};
document.getElementById('reset').onclick=()=>{cards.forEach(c=>{c.x=c.defaultX;c.y=c.defaultY;place(c)});drawLinks();persist();focusGroup('setup')};
document.getElementById('close-inspector').onclick=()=>document.getElementById('inspector').close();document.getElementById('details').onclick=()=>document.getElementById('capture-details').showModal();document.getElementById('close-details').onclick=()=>document.getElementById('capture-details').close();
document.getElementById('export').onclick=()=>{const blob=new Blob([JSON.stringify({build:data.build,device:data.device,capturedAt:data.capturedAt,screens:cards.map(({id,title,group,x,y,note})=>({id,title,group,x,y,note}))},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='olea-screen-review.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
window.addEventListener('resize',transform);drawLinks();focusGroup('setup');
})();
